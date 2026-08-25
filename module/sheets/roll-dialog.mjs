import SD6 from "../config.mjs";
import { stagger } from "../motion.mjs";

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

  /**
   * Recalcule l'aperçu à chaque changement du formulaire.
   *
   * Le dialogue est en submitOnChange: false — rien ne se recalcule tout
   * seul, il faut écouter. Les deux événements sont nécessaires : « change »
   * pour les listes et les cases, « input » pour les champs numériques, qui
   * n'émettent « change » qu'à la perte du focus.
   */
  _onRender(context, options) {
    super._onRender?.(context, options);
    if ( !this.element ) return;
    stagger(this.element.querySelectorAll(".effect-sources li"));
    this.element.addEventListener("change", () => this.#syncPool());
    this.element.addEventListener("input", () => this.#syncPool());
    this.#syncPool();
  }

  /**
   * Affiche ce qui partira réellement.
   *
   * Les valeurs sont lues sur les champs plutôt que sur un FormData, et les
   * options passées à computeSkillPool() sont formées exactement comme dans
   * _onRoll() : l'aperçu et le jet doivent voir la même chose, y compris
   * quand une case n'existe pas parce qu'aucun effet ne s'applique.
   */
  #syncPool() {
    const root = this.element;
    const box = root?.querySelector("[data-pool]");
    if ( !box ) return;

    const num = name => Number(root.querySelector(`[name="${name}"]`)?.value) || 0;
    const on = name => root.querySelector(`[name="${name}"]`)?.checked ?? false;

    const { pool, raw, count, desavantage } = this.actor.computeSkillPool(this.skillId, {
      bonusDice: num("bonusDice"),
      malusDice: num("malusDice"),
      applyBonusEffects: on("applyEffectBonus"),
      applyMalusEffects: on("applyEffectMalus"),
      gainStress: on("gainStress")
    });

    // Les dés retirés par le plafond de monde restent visibles, barrés :
    // sans eux, le joueur ne comprend pas pourquoi son bonus n'a rien donné.
    const capped = Math.max(0, raw - pool);
    const dice = [];
    for ( let i = 0; i < count; i++ ) dice.push(false);
    if ( !desavantage ) for ( let i = 0; i < capped; i++ ) dice.push(true);

    box.classList.toggle("disadvantage", desavantage);
    box.querySelector(".roll-pool-dice").replaceChildren(...dice.map((isCapped, i) => {
      const die = document.createElement("i");
      if ( isCapped ) die.classList.add("capped");
      die.style.setProperty("--sd6-i", String(i));
      return die;
    }));
    box.querySelector(".roll-pool-count").textContent = desavantage
      ? game.i18n.localize("SD6.jets.desavantage")
      : game.i18n.format("SD6.jets.poolHint", { count: pool });
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
