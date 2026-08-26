import SD6 from "./config.mjs";

/**
 * Migration des données de monde.
 *
 * Deux mécanismes cohabitent, et c'est volontaire :
 *
 * - `TypeDataModel.migrateData()`, dans chaque modèle de données, normalise à
 *   la volée tout document chargé, y compris ceux qu'une migration de monde
 *   n'a jamais vus — import de compendium, copie depuis un autre monde,
 *   delta de jeton non lié. Il rattrape, mais n'écrit rien.
 * - ce module écrit. Il parcourt le monde une fois par version et persiste les
 *   corrections, pour que les données stockées finissent par correspondre au
 *   schéma courant.
 *
 * Retirer l'un des deux laisse un trou : sans le premier, un import ancien
 * casse ; sans le second, chaque chargement repaie le coût de la conversion.
 */

/**
 * Dernière version du système ayant introduit un changement de données.
 * Un monde estampillé à cette version ou au-delà n'a rien à migrer.
 */
export const LAST_DATA_VERSION = "0.2.0";

/**
 * Lance la migration si le monde en a besoin. Appelé au hook `ready`.
 * Seul le MJ agit : la migration écrit, et un seul client doit le faire.
 */
export async function migrateWorldIfNeeded() {
  if ( !game.user.isGM ) return;

  const stored = game.settings.get(SD6.id, "worldVersion");
  const target = game.system.version;

  // Monde vierge : rien à migrer, on estampille et on sort.
  if ( !stored && !game.actors.size && !game.items.size && !game.scenes.size ) {
    return game.settings.set(SD6.id, "worldVersion", target);
  }

  if ( stored && !foundry.utils.isNewerVersion(LAST_DATA_VERSION, stored) ) return;

  await migrateWorld(stored || game.i18n.localize("SD6.migration.unknownVersion"), target);
}

/**
 * Parcourt les documents du monde et applique les corrections.
 * @param {string} from  Version d'origine, pour le message.
 * @param {string} to    Version cible, estampillée en fin de parcours.
 */
async function migrateWorld(from, to) {
  ui.notifications.info(game.i18n.format("SD6.migration.begin", { from, to }), { permanent: true });

  let migrated = 0;
  let failed = 0;

  for ( const actor of game.actors ) {
    try {
      const updates = migrateActorData(actor.toObject());
      if ( foundry.utils.isEmpty(updates) ) continue;
      await actor.update(updates);
      migrated++;
    } catch ( err ) {
      failed++;
      console.error(`${SD6.title} | migration de l'acteur « ${actor.name} » :`, err);
    }
  }

  // Les jetons liés suivent leur acteur de monde, déjà traité ci-dessus.
  // Seuls les jetons non liés portent leurs propres données.
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.delta ) continue;
      try {
        const updates = migrateActorData({ system: token.delta.toObject().system ?? {} });
        if ( foundry.utils.isEmpty(updates) ) continue;
        await token.update(Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [`delta.${key}`, value])
        ));
        migrated++;
      } catch ( err ) {
        failed++;
        console.error(`${SD6.title} | migration du jeton « ${token.name} » (${scene.name}) :`, err);
      }
    }
  }

  await game.settings.set(SD6.id, "worldVersion", to);

  const message = migrated
    ? game.i18n.format("SD6.migration.done", { count: migrated })
    : game.i18n.localize("SD6.migration.none");
  ui.notifications.info(message, { permanent: true });

  if ( failed ) {
    ui.notifications.error(game.i18n.format("SD6.migration.failed", { count: failed }), { permanent: true });
  }
}

/**
 * Corrections à appliquer aux données brutes d'un acteur.
 *
 * Reçoit les données source — jamais le document préparé, dont le schéma a
 * déjà masqué l'ancien format.
 *
 * @param {object} source  Données de l'acteur, telles que `toObject()` les rend.
 * @returns {object}  Chemins aplatis à mettre à jour. Vide s'il n'y a rien à faire.
 */
export function migrateActorData(source) {
  const updates = {};

  // 0.2.0 — rsc.stress passe d'un nombre à { value, max }, pour que Foundry
  // sache en faire une barre de ressource sur le pion.
  const stress = source.system?.rsc?.stress;
  if ( typeof stress === "number" ) {
    updates["system.rsc.stress"] = {
      value: Math.max(0, Math.min(stress, SD6.stressMax)),
      max: SD6.stressMax
    };
  }

  return updates;
}
