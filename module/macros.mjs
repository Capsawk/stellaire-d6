import SD6 from "./config.mjs";
import { resolveActingActor } from "./helpers.mjs";
import { RollSkillDialog } from "./sheets/roll-dialog.mjs";

/**
 * Macros de la barre raccourcis.
 *
 * Glisser une compétence ou une arme sur la barre y crée une macro : c'est un
 * réflexe acquis dans Foundry, et son absence se remarque. Les macros créées
 * appellent l'API publique `stellaire`, pas des internes — elles survivent
 * donc à une refonte du système.
 */

/** Branche la création de macros. À appeler au hook `init`. */
export function registerMacroHooks() {
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if ( data.type === "sd6.skill" ) {
      createSkillMacro(data.skill, slot);
      return false;
    }
    if ( data.type === "Item" ) {
      createItemMacro(data.uuid, slot);
      return false;
    }
  });
}

/**
 * Crée — ou réutilise — une macro de jet de compétence.
 * @param {string} skill  Clé de SD6.skills.
 * @param {number} slot   Emplacement visé dans la barre.
 */
async function createSkillMacro(skill, slot) {
  if ( !(skill in SD6.skills) ) return;
  const label = game.i18n.localize(SD6.skills[skill].label);
  await assignMacro({
    name: game.i18n.format("SD6.macros.skillName", { skill: label }),
    img: "systems/stellaire-d6/assets/thumb-stellaire-d6.webp",
    command: `stellaire.rollSkillMacro("${skill}");`
  }, slot);
}

/**
 * Crée — ou réutilise — une macro d'attaque pour une arme.
 * @param {string} uuid  UUID de l'item déposé.
 * @param {number} slot  Emplacement visé dans la barre.
 */
async function createItemMacro(uuid, slot) {
  const item = await fromUuid(uuid);
  if ( !item ) return;
  if ( item.type !== "arme" ) {
    ui.notifications.warn(game.i18n.format("SD6.macros.notRollable", {
      type: game.i18n.localize(`TYPES.Item.${item.type}`)
    }));
    return;
  }
  await assignMacro({
    name: game.i18n.format("SD6.macros.attackName", { weapon: item.name }),
    img: item.img,
    command: `stellaire.rollItemMacro("${uuid}");`
  }, slot);
}

/**
 * Place une macro dans la barre, en réutilisant une macro identique si elle
 * existe déjà — sinon chaque glisser-déposer en créerait un doublon.
 * @param {{name: string, img: string, command: string}} data
 * @param {number} slot
 */
async function assignMacro(data, slot) {
  const existing = game.macros.find(macro =>
    (macro.name === data.name) && (macro.command === data.command) && macro.isAuthor);
  const macro = existing ?? await Macro.create({ ...data, type: "script", scope: "actor" });
  await game.user.assignHotbarMacro(macro, slot);
}

/**
 * Ouvre le dialogue de jet pour une compétence, au nom de l'acteur courant.
 * Exposé via `stellaire.rollSkillMacro` : c'est ce qu'appellent les macros.
 * @param {string} skill  Clé de SD6.skills.
 */
export function rollSkillMacro(skill) {
  const actor = resolveActingActor();
  if ( !actor ) return ui.notifications.warn(game.i18n.localize("SD6.macros.noActor"));
  if ( !(skill in SD6.skills) ) {
    return ui.notifications.warn(game.i18n.format("SD6.macros.unknownSkill", { skill }));
  }
  const label = game.i18n.localize(SD6.skills[skill].label);
  new RollSkillDialog(actor, skill, {
    window: { title: game.i18n.format("SD6.jets.skillTitle", { skill: label }) }
  }).render(true);
}

/**
 * Lance l'attaque d'une arme désignée par son UUID.
 * Exposé via `stellaire.rollItemMacro`.
 * @param {string} uuid
 * @returns {Promise<void>}
 */
export async function rollItemMacro(uuid) {
  const item = await fromUuid(uuid);
  if ( !item?.actor ) return ui.notifications.warn(game.i18n.localize("SD6.macros.itemMissing"));
  await item.rollAttack();
}
