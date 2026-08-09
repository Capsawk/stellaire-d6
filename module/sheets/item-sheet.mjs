import SD6 from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class StellaireItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["stellaire-d6", "item"],
    position: { width: 520, height: 560 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      removeIdentiteItem: this._onRemoveIdentiteItem,
      openIdentiteItem: this._onOpenIdentiteItem,
      addEffect: this._onAddEffect,
      deleteEffect: this._onDeleteEffect
    }
  };

  static PARTS = {
    form: { template: "systems/stellaire-d6/templates/item/item.hbs" }
  };

  static TABS = {
    "sd6-item": {
      initial: "details",
      tabs: [
        { id: "details", label: "SD6.tabs.details" },
        { id: "effets", label: "SD6.tabs.effets" }
      ]
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.document;
    context.system = this.document.system;
    context.itemTypeLabel = game.i18n.localize(`TYPES.Item.${this.document.type}`);
    context.showBonus = ["arme", "armure", "outil", "relique"].includes(this.document.type);
    context.showEffet = ["arme", "relique"].includes(this.document.type);
    context.showProtection = this.document.type === "armure";
    context.showEquipped = ["arme", "armure", "outil", "relique", "equipement"].includes(this.document.type);
    context.isOrigine = this.document.type === SD6.origineType;
    context.isRole = this.document.type === SD6.roleType;
    context.isIdentiteItem = context.isOrigine || context.isRole;
    context.showEffets = SD6.effectItemTypes.includes(this.document.type);

    context.skills = Object.entries(SD6.skills).map(([id, skill]) => ({
      id,
      label: game.i18n.localize(skill.label)
    }));
    context.effectTypes = {};
    for ( const [id, label] of Object.entries(SD6.effectTypes) ) context.effectTypes[id] = game.i18n.localize(label);

    if ( context.tabs && !context.showEffets ) {
      context.tabs = Object.fromEntries(
        Object.entries(context.tabs).filter(([, tab]) => tab.id !== "effets")
      );
    }
    context.tabActive = {};
    const tabValues = Object.values(context.tabs ?? {});
    for ( const tab of tabValues ) context.tabActive[tab.id] = tab.active;
    if ( !Object.values(context.tabActive).some(Boolean) && tabValues.length ) {
      context.tabActive[tabValues[0].id] = true;
    }

    context.effects = [];
    for ( const effect of this.document.effects ) {
      context.effects.push({
        id: effect.id,
        skill: this._effectSkill(effect),
        type: this._effectType(effect),
        value: this._effectValue(effect)
      });
    }

    context.system.descriptionEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.description ?? "",
      { secrets: this.document.isOwner, documents: true }
    );

    if ( context.isOrigine ) {
      context.system.bonusEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        context.system.bonus ?? "",
        { secrets: this.document.isOwner, documents: true }
      );
      context.system.malusEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        context.system.malus ?? "",
        { secrets: this.document.isOwner, documents: true }
      );
    }

    context.identiteItems = [];
    if ( context.isIdentiteItem ) {
      context.itemsLabel = game.i18n.localize(`SD6.${this.document.type}.items`);
      context.itemsDropLabel = game.i18n.localize(`SD6.${this.document.type}.items_drop`);
      context.itemsEmptyLabel = game.i18n.localize(`SD6.${this.document.type}.items_empty`);
      for ( const uuid of context.system.items ?? [] ) {
        const item = await fromUuid(uuid);
        if ( item ) {
          context.identiteItems.push({
            uuid,
            name: item.name,
            img: item.img,
            typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`)
          });
        }
      }
    }
    return context;
  }

  static async _onRemoveIdentiteItem(event, target) {
    const items = foundry.utils.duplicate(this.document.system.items ?? []);
    const index = items.indexOf(target.dataset.uuid);
    if ( index !== -1 ) items.splice(index, 1);
    await this.document.update({ "system.items": items });
    this.render();
  }

  static async _onOpenIdentiteItem(event, target) {
    const item = await fromUuid(target.dataset.uuid);
    item?.sheet.render(true);
  }

  /**
   * Lit la compétence ciblée par un effet.
   * @param {ActiveEffect} effect
   * @returns {string|undefined}
   */
  _effectSkill(effect) {
    return effect.getFlag("stellaire-d6", "skill")
      ?? effect.changes[0]?.key?.split(".")?.[2];
  }

  /**
   * Lit le type (bonus/malus) d'un effet.
   * @param {ActiveEffect} effect
   * @returns {string|undefined}
   */
  _effectType(effect) {
    return effect.getFlag("stellaire-d6", "type")
      ?? effect.changes[0]?.key?.split(".")?.[3];
  }

  /**
   * Lit la valeur (nombre de dés) d'un effet.
   * @param {ActiveEffect} effect
   * @returns {number}
   */
  _effectValue(effect) {
    const value = Number(effect.changes[0]?.value);
    return Number.isFinite(value) ? value : 1;
  }

  /**
   * Construit le nom affiché d'un effet.
   * @param {string} skill  Clé de compétence.
   * @param {string} type   "bonus" ou "malus".
   * @param {number} value  Nombre de dés.
   * @returns {string}
   */
  _effectName(skill, type, value) {
    const sign = type === "bonus" ? "+" : "−";
    const skillLabel = game.i18n.localize(SD6.skills[skill]?.label ?? "SD6.effets.unknown");
    const typeLabel = game.i18n.localize(`SD6.effets.types.${type}`);
    return `${typeLabel} ${sign}${value} · ${skillLabel}`;
  }

  /**
   * Données d'un ActiveEffect d'effet (key, flags, name) reconstruites
   * à partir d'une compétence, d'un type et d'une valeur.
   */
  _effectData(skill, type, value) {
    return {
      changes: [{
        key: `system.effets.${skill}.${type}`,
        value: String(value),
        mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.ADD,
        priority: 0
      }],
      flags: { "stellaire-d6": { skill, type } },
      name: this._effectName(skill, type, value)
    };
  }

  /** @inheritDoc */
  _onFirstRender(context, options) {
    super._onFirstRender?.(context, options);
    this._bindEffectChanges();
  }

  /** @inheritDoc */
  _onRender(context, options) {
    super._onRender?.(context, options);
    this._bindEffectChanges();
  }

  /**
   * Écoute les modifications des champs d'effet (délégation sur la fenêtre,
   * conservée entre les rendus).
   */
  _bindEffectChanges() {
    if ( !this._effectsBound ) {
      this._effectsBound = true;
      this.element.addEventListener("change", this._onEffectChange.bind(this));
    }
  }

  /**
   * Met à jour un ActiveEffect d'effet depuis une ligne du formulaire.
   * @param {Event} event
   */
  async _onEffectChange(event) {
    const target = event.target.closest("[data-effect-field]");
    if ( !target || !this.isEditable ) return;
    const effect = this.document.effects.get(target.dataset.effectId);
    if ( !effect ) return;

    const field = target.dataset.effectField;
    const skill = field === "skill" ? target.value : (effect.getFlag("stellaire-d6", "skill") ?? this._effectSkill(effect));
    const type = field === "type" ? target.value : (effect.getFlag("stellaire-d6", "type") ?? this._effectType(effect));
    const value = field === "value" ? Math.max(1, Number(target.value) || 1) : this._effectValue(effect);

    if ( !skill || !type ) return;
    await effect.update(this._effectData(skill, type, value));
    this.render();
  }

  static async _onAddEffect(event, target) {
    const item = this.document;
    const data = this._effectData("combattre", "bonus", 1);
    await ActiveEffect.create([{
      ...data,
      icon: item.img,
      transfer: false
    }], { parent: item });
    this.render();
  }

  static async _onDeleteEffect(event, target) {
    const effect = this.document.effects.get(target.dataset.effectId);
    if ( effect ) await effect.delete();
    this.render();
  }

  /**
   * Dépose d'un document sur la fiche d'un Item.
   * Sur une fiche « Origine » ou « Rôle », un Item déposé est ajouté aux
   * objets transmis.
   * @override
   */
  async _onDropDocument(event, document) {
    const item = this.document;
    if ( document.documentName === "Item" && [SD6.origineType, SD6.roleType].includes(item.type) ) {
      if ( !this.isEditable ) return null;
      if ( document.type === item.type || document.uuid === item.uuid ) {
        ui.notifications.warn(game.i18n.localize(`SD6.${item.type}.drop_invalid`));
        return null;
      }
      const items = new Set(item.system.items ?? []);
      items.add(document.uuid);
      await item.update({ "system.items": [...items] });
      this.render();
      return document;
    }
    return super._onDropDocument(event, document);
  }
}
