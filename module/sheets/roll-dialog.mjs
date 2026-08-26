import SD6 from "../config.mjs";

const { ApplicationV2 } = foundry.applications.api;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class RollSkillDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "stellaire-roll-dialog",
    tag: "form",
    classes: ["stellaire-d6", "roll-dialog"],
    position: { width: 420 },
    window: {
      title: "SD6.jets.title",
      icon: "fa-solid fa-dice-d6"
    },
    form: {
      handler: this._onRoll,
      submitOnChange: false,
      closeOnSubmit: true
    }
  };

  static PARTS = {
    form: { template: "systems/stellaire-d6/templates/chat/roll-dialog.hbs" }
  };

  constructor(actor, skillId, options = {}) {
    super(options);
    this.actor = actor;
    this.skillId = skillId;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.skillLabel = game.i18n.localize(SD6.skills[this.skillId].label);
    context.positions = {};
    for ( const [id, label] of Object.entries(SD6.positions) ) context.positions[id] = game.i18n.localize(label);
    context.effets = {};
    for ( const [id, label] of Object.entries(SD6.effets) ) context.effets[id] = game.i18n.localize(label);
    context.stress = this.actor.system.rsc.stress.value;
    context.stressMax = this.actor.system.rsc.stress.max;
    context.stressFull = context.stress >= 6;

    const skillEffects = this.actor.getSkillEffectDice(this.skillId);
    context.effectBonus = skillEffects.bonus;
    context.effectMalus = skillEffects.malus;
    context.effectBonusSources = skillEffects.sources.filter(s => s.type === "bonus");
    context.effectMalusSources = skillEffects.sources.filter(s => s.type === "malus");
    return context;
  }

  static async _onRoll(event, form, formData) {
    const data = formData.object;
    await this.actor.rollSkill(this.skillId, {
      bonusDice: Number(data.bonusDice) || 0,
      malusDice: Number(data.malusDice) || 0,
      applyBonusEffects: Boolean(data.applyEffectBonus),
      applyMalusEffects: Boolean(data.applyEffectMalus),
      gainStress: Boolean(data.gainStress),
      position: data.position,
      effet: data.effet
    });
  }
}
