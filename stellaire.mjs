import SD6 from "./module/config.mjs";
import { personnageConfig, itemConfig } from "./module/data-models.mjs";
import { StellaireActor } from "./module/actor.mjs";
import { StellaireItem } from "./module/item.mjs";
import { CharacterActorSheet } from "./module/sheets/character-sheet.mjs";
import { StellaireItemSheet } from "./module/sheets/item-sheet.mjs";
import { registerSettings, applyInitiativeFormula } from "./module/settings.mjs";
import { migrateWorldIfNeeded } from "./module/migration.mjs";
import { registerEnrichers, activateEnricherListeners } from "./module/enrichers.mjs";
import { registerMacroHooks, rollSkillMacro, rollItemMacro } from "./module/macros.mjs";
import { applyTheme, watchSystemTheme } from "./module/theme.mjs";
import { applyMotionLevel, animateChatCard } from "./module/motion.mjs";
import * as skillEffects from "./module/skill-effects.mjs";

const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;

DocumentSheetConfig.registerSheet(Actor, "stellaire-d6", CharacterActorSheet, {
  types: ["personnage"],
  makeDefault: true,
  label: "Personnage"
});

DocumentSheetConfig.registerSheet(Item, "stellaire-d6", StellaireItemSheet, {
  types: SD6.allItemTypes,
  makeDefault: true,
  label: "Stellaire D6"
});

Hooks.once("init", () => {
  console.log('Stellaire D6 :: System loaded');
  console.log(SD6.ascii);

  CONFIG.Actor.documentClass = StellaireActor;
  Object.assign(CONFIG.Actor.dataModels, personnageConfig);

  CONFIG.Item.documentClass = StellaireItem;
  Object.assign(CONFIG.Item.dataModels, itemConfig);

  registerSettings();
  applyInitiativeFormula(game.settings.get(SD6.id, "initiativeFormula"));

  // Les gravités d'état deviennent des effets de statut Foundry : elles
  // apparaissent alors dans le HUD du pion et sur le jeton lui-même.
  for ( const gravite of Object.values(SD6.gravites) ) {
    CONFIG.statusEffects.push({
      id: gravite.status,
      name: gravite.label,
      img: gravite.img
    });
  }

  registerEnrichers();
  registerMacroHooks();
  foundry.applications.handlebars.loadTemplates(SD6.templates);

  // Surface publique du système. Les macros de la barre raccourcis et les
  // modules tiers passent par ici plutôt que par les chemins internes, qui
  // peuvent bouger d'une version à l'autre.
  globalThis.stellaire = {
    SD6,
    rollSkillMacro,
    rollItemMacro,
    skillEffects,
    documents: { StellaireActor, StellaireItem }
  };
});

// Met en scène les cartes de jet et d'objet à leur arrivée. Le hook rejoue
// pour tout le journal à chaque rechargement de page : c'est animateChatCard
// qui écarte les messages qui ne viennent pas d'être créés.
Hooks.on("renderChatMessageHTML", (message, html) => animateChatCard(message, html));

Hooks.once("ready", () => {
  applyTheme();
  applyMotionLevel();
  watchSystemTheme();
  activateEnricherListeners();
  migrateWorldIfNeeded();
});
