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
      removeOrigineItem: this._onRemoveOrigineItem,
      openOrigineItem: this._onOpenOrigineItem
    }
  };

  static PARTS = {
    form: { template: "systems/stellaire-d6/templates/item/item.hbs" }
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
      context.origineItems = [];
      for ( const uuid of context.system.items ?? [] ) {
        const item = await fromUuid(uuid);
        if ( item ) {
          context.origineItems.push({
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

  static async _onRemoveOrigineItem(event, target) {
    const items = foundry.utils.duplicate(this.document.system.items ?? []);
    const index = items.indexOf(target.dataset.uuid);
    if ( index !== -1 ) items.splice(index, 1);
    await this.document.update({ "system.items": items });
    this.render();
  }

  static async _onOpenOrigineItem(event, target) {
    const item = await fromUuid(target.dataset.uuid);
    item?.sheet.render(true);
  }

  /**
   * Dépose d'un document sur la fiche d'un Item.
   * Sur une fiche « Origine », un Item déposé est ajouté aux objets transmis.
   * @override
   */
  async _onDropDocument(event, document) {
    const item = this.document;
    if ( document.documentName === "Item" && item.type === SD6.origineType ) {
      if ( !this.isEditable ) return null;
      if ( document.type === SD6.origineType || document.uuid === item.uuid ) {
        ui.notifications.warn(game.i18n.localize("SD6.origine.drop_invalid"));
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
