import SD6 from "./config.mjs";
import { applyTheme } from "./theme.mjs";
import { applyMotionLevel } from "./motion.mjs";

/**
 * Réglages de monde du système.
 *
 * Deux valeurs étaient jusqu'ici figées dans le code : le plafond de la pool
 * et, par défaut de déclaration, la formule d'initiative de Foundry. Les
 * exposer permet à chaque table de les ajuster sans toucher au système.
 *
 * S'y ajoutent l'apparence et le mouvement, qui relèvent du confort de
 * chacun : le thème et le niveau d'animation sont des réglages de joueur,
 * le second étant plafonné par un défaut de table.
 */
export function registerSettings() {
  // Version de données du monde. Non exposée : c'est la migration qui l'écrit.
  game.settings.register(SD6.id, "worldVersion", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register(SD6.id, "maxDice", {
    name: "SD6.settings.maxDice.name",
    hint: "SD6.settings.maxDice.hint",
    scope: "world",
    config: true,
    type: Number,
    default: SD6.maxDice,
    range: { min: 1, max: 10, step: 1 }
  });

  game.settings.register(SD6.id, "sheetTheme", {
    name: "SD6.settings.theme.name",
    hint: "SD6.settings.theme.hint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      auto: "SD6.settings.theme.auto",
      dark: "SD6.settings.theme.dark",
      light: "SD6.settings.theme.light"
    },
    default: "auto",
    onChange: () => applyTheme()
  });

  // Le MJ fixe le plafond de sa table, le joueur ne peut que descendre en
  // dessous. Sans cette hiérarchie, le réglage de monde ne serait qu'une
  // suggestion et le MJ n'aurait aucun moyen de tenir sa table.
  game.settings.register(SD6.id, "animationsDefault", {
    name: "SD6.settings.animations.worldName",
    hint: "SD6.settings.animations.worldHint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      spectaculaire: "SD6.settings.animations.spectaculaire",
      pleine: "SD6.settings.animations.pleine",
      sobre: "SD6.settings.animations.sobre",
      aucune: "SD6.settings.animations.aucune"
    },
    // « spectaculaire » fait déborder l'effet de critique hors de la carte,
    // sur le journal de chat : il s'active, il ne s'impose pas.
    default: "pleine",
    onChange: () => applyMotionLevel()
  });

  game.settings.register(SD6.id, "animations", {
    name: "SD6.settings.animations.clientName",
    hint: "SD6.settings.animations.clientHint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      defaut: "SD6.settings.animations.defaut",
      pleine: "SD6.settings.animations.pleine",
      sobre: "SD6.settings.animations.sobre",
      aucune: "SD6.settings.animations.aucune"
    },
    default: "defaut",
    onChange: () => applyMotionLevel()
  });

  game.settings.register(SD6.id, "initiativeFormula", {
    name: "SD6.settings.initiative.name",
    hint: "SD6.settings.initiative.hint",
    scope: "world",
    config: true,
    type: String,
    default: SD6.defaultInitiative,
    onChange: value => applyInitiativeFormula(value)
  });
}

/**
 * Plafond de la pool de dés.
 *
 * Passe par le réglage de monde quand il est disponible, et retombe sur la
 * valeur du système sinon — le calcul de jet peut être appelé avant que les
 * réglages soient enregistrés, notamment depuis un test ou une macro précoce.
 * @returns {number}
 */
export function maxDice() {
  if ( game.settings?.settings?.has(`${SD6.id}.maxDice`) ) {
    return game.settings.get(SD6.id, "maxDice");
  }
  return SD6.maxDice;
}

/**
 * Applique la formule d'initiative au tracker de combat.
 * @param {string} formula
 */
export function applyInitiativeFormula(formula) {
  CONFIG.Combat.initiative = {
    formula: formula || SD6.defaultInitiative,
    decimals: 0
  };
}
