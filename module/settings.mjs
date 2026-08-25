import SD6 from "./config.mjs";
import { applyTheme } from "./theme.mjs";

/**
 * Réglages de monde du système.
 *
 * Deux valeurs étaient jusqu'ici figées dans le code : le plafond de la pool
 * et, par défaut de déclaration, la formule d'initiative de Foundry. Les
 * exposer permet à chaque table de les ajuster sans toucher au système.
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
