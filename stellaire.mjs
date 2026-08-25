import SD6 from "./module/config.mjs";
import { personnageConfig, itemConfig } from "./module/data-models.mjs";
import { StellaireActor } from "./module/actor.mjs";
import { StellaireItem } from "./module/item.mjs";
import { CharacterActorSheet } from "./module/sheets/character-sheet.mjs";
import { StellaireItemSheet } from "./module/sheets/item-sheet.mjs";
import { registerSettings, applyInitiativeFormula } from "./module/settings.mjs";
import { migrateWorldIfNeeded } from "./module/migration.mjs";

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
});

Hooks.once("ready", () => migrateWorldIfNeeded());
