import SD6 from "../config.mjs";
import { RollSkillDialog } from "./roll-dialog.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CharacterActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["stellaire-d6", "actor"],
    position: { width: 800, height: 880 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      toggleLock: this._onToggleLock,
      addEtat: this._onAddEtat,
      deleteEtat: this._onDeleteEtat,
      rollSkill: this._onRollSkill,
      attackItem: this._onAttackItem,
      addItem: this._onAddItem,
      editItem: this._onEditItem,
      deleteItem: this._onDeleteItem,
      toggleEquip: this._onToggleEquip,
      addAbilitie: this._onAddAbilitie,
      editAbilitie: this._onEditAbilitie,
      deleteAbilitie: this._onDeleteAbilitie,
      chatAbilitie: this._onChatAbilitie
    }
  };

  static PARTS = {
    form: { template: "systems/stellaire-d6/templates/actor/personnage.hbs" }
  };

  static TABS = {
    "sd6-main": {
      initial: "personnage",
      tabs: [
        { id: "personnage", label: "SD6.tabs.personnage" },
        { id: "inventaire", label: "SD6.item.title" },
        { id: "biographie", label: "SD6.tabs.biographie" }
      ]
    }
  };

  _getFrameButtons(options) {
    const locked = this.document.getFlag("stellaire-d6", "locked") ?? false;
    return [
      {
        action: "toggleLock",
        label: locked ? "SD6.lock.unlock" : "SD6.lock.lock",
        icon: locked ? "fa-solid fa-lock" : "fa-solid fa-lock-open"
      }
    ];
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.document;
    context.system = this.document.system;
    context.locked = this.document.getFlag("stellaire-d6", "locked") ?? false;

    context.tabActive = {};
    for ( const tab of Object.values(context.tabs ?? {}) ) {
      context.tabActive[tab.id] = tab.active;
    }

    context.skillGroups = SD6.skillGroups.map(group => ({
      id: group.id,
      label: game.i18n.localize(group.label),
      skills: group.skills.map(id => ({
        id,
        label: game.i18n.localize(SD6.skills[id].label),
        value: context.system.skills[id]
      }))
    }));

    context.gravites = {};
    for (const [key, label] of Object.entries(SD6.gravites)) {
      context.gravites[key] = game.i18n.localize(label);
    }

    context.etats = context.system.etats;

    const stress = context.system.rsc.stress;
    context.stressPips = Array.from({ length: 6 }, (_, i) => i < stress);
    context.stressFull = stress >= 6;

    context.abilitieTypes = {};
    for ( const type of SD6.abilitieTypes ) context.abilitieTypes[type] = game.i18n.localize(`TYPES.Item.${type}`);
    context.abilites = this.document.items
      .filter(item => SD6.abilitieTypes.includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        type: item.type,
        typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`)
      }));

    context.equipement = this.document.items
      .filter(item => item.system.equipped && ["arme", "armure"].includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        type: item.type,
        typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
        isArme: item.type === "arme"
      }));

    context.itemTypes = {};
    for ( const type of SD6.itemTypes ) context.itemTypes[type] = game.i18n.localize(`TYPES.Item.${type}`);
    context.inventory = this.document.items
      .filter(item => !SD6.abilitieTypes.includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        type: item.type,
        typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
        equipped: item.system.equipped ?? false,
        isArme: item.type === "arme"
      }));

    context.system.biographieEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.biographie ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    context.system.notesEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.notes ?? "",
      { secrets: this.document.isOwner, documents: true }
    );

    return context;
  }

  static async _onToggleLock(event, target) {
    const locked = this.document.getFlag("stellaire-d6", "locked") ?? false;
    await this.document.setFlag("stellaire-d6", "locked", !locked);
    this.render();
  }

  static async _onAddEtat(event, target) {
    const etats = foundry.utils.duplicate(this.document.system.etats);
    etats.push({ label: "", gravite: "leger" });
    await this.document.update({ "system.etats": etats });
  }

  static async _onDeleteEtat(event, target) {
    const index = Number(target.dataset.index);
    const etats = foundry.utils.duplicate(this.document.system.etats);
    etats.splice(index, 1);
    await this.document.update({ "system.etats": etats });
  }

  static async _onAddAbilitie(event, target) {
    const type = this.element.querySelector('select[name="abilitieType"]').value;
    const name = game.i18n.localize(`TYPES.Item.${type}`);
    await Item.create({ name, type }, { parent: this.document });
  }

  static async _onEditAbilitie(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    item.sheet.render(true);
  }

  static async _onDeleteAbilitie(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await item.delete();
  }

  static async _onChatAbilitie(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      item.system.description ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    const content = await foundry.applications.handlebars.renderTemplate("systems/stellaire-d6/templates/chat/item.hbs", {
      name: item.name,
      img: item.img,
      typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
      description
    });
    const messageData = {
      content,
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flags: { "core": { "canPopout": true } }
    };
    ChatMessage.applyMode(messageData, game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);
  }

  static async _onRollSkill(event, target) {
    const skillId = target.dataset.skill;
    const label = game.i18n.localize(SD6.skills[skillId].label);
    new RollSkillDialog(this.document, skillId, {
      window: { title: game.i18n.format("SD6.jets.skillTitle", { skill: label }) }
    }).render(true);
  }

  static async _onAttackItem(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await item.rollAttack();
  }

  static async _onAddItem(event, target) {
    const type = this.element.querySelector('select[name="itemType"]').value;
    const name = game.i18n.localize(`TYPES.Item.${type}`);
    const equipped = ["arme", "armure", "relique"].includes(type);
    await Item.create({ name, type, system: { equipped } }, { parent: this.document });
  }

  static async _onEditItem(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    item.sheet.render(true);
  }

  static async _onDeleteItem(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await item.delete();
  }

  static async _onToggleEquip(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await item.update({ "system.equipped": target.checked });
  }
}
