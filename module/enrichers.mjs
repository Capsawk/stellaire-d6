import SD6 from "./config.mjs";

/**
 * Enrichisseur de texte « @Jet[compétence]{libellé} ».
 *
 * Permet d'écrire un jet cliquable dans un journal, une description d'item ou
 * un message de chat, comme on écrit déjà un lien vers un document. Le MJ
 * rédige son scénario dans Foundry, les joueurs cliquent.
 *
 *   Une porte scellée. @Jet[bricoler] pour l'ouvrir.
 *   @Jet[resonner]{Écouter le Bifrost} avant qu'il ne soit trop tard.
 *
 * Une compétence inconnue laisse le texte intact plutôt que d'afficher un lien
 * mort : mieux vaut une faute visible qu'un bouton qui ne fait rien.
 */
const PATTERN = /@Jet\[([a-zA-Z]+)\](?:\{([^}]+)\})?/g;

/** Enregistre l'enrichisseur. À appeler au hook `init`. */
export function registerEnrichers() {
  CONFIG.TextEditor.enrichers.push({ pattern: PATTERN, enricher: enrichJet });
}

/**
 * Transforme une occurrence en lien cliquable.
 * @param {RegExpMatchArray} match
 * @returns {Promise<HTMLElement|null>}  null laisse le texte d'origine.
 */
async function enrichJet(match) {
  const skill = match[1].toLowerCase();
  if ( !(skill in SD6.skills) ) return null;

  const skillLabel = game.i18n.localize(SD6.skills[skill].label);
  const link = document.createElement("a");
  link.classList.add("sd6-inline-roll");
  link.dataset.skill = skill;
  link.title = game.i18n.format("SD6.jets.inline.hint", { skill: skillLabel });

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-dice-d6");
  link.append(icon, match[2] ?? skillLabel);
  return link;
}

/**
 * Branche le clic sur les jets enrichis.
 *
 * La délégation se fait une fois sur le document : les liens enrichis
 * apparaissent dans le chat, les journaux et les fiches, tous rendus à des
 * moments différents, et aucun n'a de cycle de vie commun.
 * À appeler au hook `ready`.
 */
export function activateEnricherListeners() {
  document.addEventListener("click", event => {
    const link = event.target.closest("a.sd6-inline-roll");
    if ( !link ) return;
    event.preventDefault();

    const actor = resolveRollActor();
    if ( !actor ) {
      ui.notifications.warn(game.i18n.localize("SD6.jets.inline.noActor"));
      return;
    }
    actor.rollSkill(link.dataset.skill).catch(err => {
      console.error(`${SD6.title} | jet enrichi « ${link.dataset.skill} » :`, err);
    });
  });
}

/**
 * Acteur qui lance un jet enrichi : le pion sélectionné, sinon le personnage
 * assigné à l'utilisateur.
 * @returns {Actor|null}
 */
function resolveRollActor() {
  return canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
}
