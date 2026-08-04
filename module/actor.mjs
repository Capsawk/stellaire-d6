import SD6 from "./config.mjs";

export class StellaireActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Lance un jet de compétence.
   * Pool = score de compétence + dés bonus - dés malus (+1 si Stress généré).
   * Score résultant <= 0 : 2d6 en gardant le pire (désavantage).
   * Sinon : autant de d6 que le pool, en gardant le meilleur.
   * @param {string} skillId   Identifiant de compétence (clé de SD6.skills).
   * @param {object} [options]
   * @param {number} [options.bonusDice=0]
   * @param {number} [options.malusDice=0]
   * @param {boolean} [options.gainStress=false]  Génère 1 Stress pour +1d6.
   * @param {string} [options.position="risquee"]
   * @param {string} [options.effet="normal"]
   * @param {string} [options.label]  Libellé affiché dans le chat (défaut : nom de la compétence).
   */
  async rollSkill(skillId, options = {}) {
    const {
      bonusDice = 0,
      malusDice = 0,
      gainStress = false,
      position = "risquee",
      effet = "normal",
      label = null
    } = options;

    const skill = this.system.skills?.[skillId];
    if ( skill === undefined ) throw new Error(`Compétence inconnue : ${skillId}`);
    const skillLabel = label ?? game.i18n.localize(SD6.skills[skillId].label);

    const stressGained = gainStress && (this.system.rsc.stress < 6);
    const pool = skill + bonusDice - malusDice + (stressGained ? 1 : 0);
    const desavantage = pool <= 0;
    const count = desavantage ? 2 : pool;

    const roll = new foundry.dice.Roll(`${count}d6`);
    await roll.evaluate();

    const term = roll.terms.find(t => t instanceof foundry.dice.terms.Die);
    const results = term.results.map(r => r.result);
    const countSix = results.filter(r => r === 6).length;
    const kept = desavantage ? Math.min(...results) : Math.max(...results);
    const outcome = this.constructor.evaluateOutcome(kept, countSix, desavantage);

    const dice = results.map(result => {
      let colorClass = "fail";
      if ( result >= 6 ) colorClass = (!desavantage && countSix >= 2) ? "crit" : "success";
      else if ( result >= 4 ) colorClass = "mixed";
      return { result, kept: result === kept, colorClass };
    });

    const tags = [
      { cls: "position", label: game.i18n.localize(`SD6.jets.positions.${position}`) },
      { cls: "effet", label: game.i18n.localize(`SD6.jets.effets.${effet}`) }
    ];
    if ( desavantage ) tags.push({ cls: "desavantage", label: game.i18n.localize("SD6.jets.desavantage") });
    if ( stressGained ) tags.push({ cls: "stress", label: game.i18n.localize("SD6.jets.stress") });

    const content = await foundry.applications.handlebars.renderTemplate("systems/stellaire-d6/templates/chat/roll.hbs", {
      actorName: this.name,
      skillLabel,
      tags,
      dice,
      outcomeClass: outcome,
      outcomeLabel: game.i18n.localize(`SD6.jets.outcomes.${outcome}.title`),
      outcomeDetail: game.i18n.localize(`SD6.jets.outcomes.${outcome}.detail`)
    });

    const messageData = {
      content,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flags: { "core": { "canPopout": true } },
      rolls: [roll]
    };
    ChatMessage.applyMode(messageData, game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);

    if ( stressGained ) {
      await this.update({ "system.rsc.stress": this.system.rsc.stress + 1 });
    }
  }

  /**
   * Interprète le résultat d'un jet.
   * @param {number} kept      Dé conservé.
   * @param {number} countSix  Nombre de 6 dans le pool.
   * @param {boolean} [desavantage=false]  Jet en désavantage (2d6, garde le pire) — aucune critique possible.
   * @returns {"critique"|"net"|"complication"|"echec"}
   */
  static evaluateOutcome(kept, countSix, desavantage = false) {
    if ( !desavantage && countSix >= 2 ) return "critique";
    if ( kept >= 6 ) return "net";
    if ( kept >= 4 ) return "complication";
    return "echec";
  }
}
