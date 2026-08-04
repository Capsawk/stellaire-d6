const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class StellaireItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["stellaire-d6", "item"],
    position: { width: 520, height: 560 },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
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
    context.system.descriptionEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.description ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    return context;
  }
}
