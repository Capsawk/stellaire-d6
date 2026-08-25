import SD6 from "./config.mjs";

export class StellaireItem extends Item {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Pose l'icône du type quand aucune n'est fournie.
   *
   * Foundry retombe sinon sur son sac générique pour les dix types, ce qui
   * rend un inventaire illisible d'un coup d'œil. Une icône explicitement
   * choisie — y compris à l'import d'un compendium — n'est jamais écrasée.
   * @inheritdoc
   */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if ( allowed === false ) return false;

    if ( !data.img ) {
      const img = SD6.itemIcons[this.type];
      if ( img ) this.updateSource({ img });
    }
    return allowed;
  }

  /**
   * Données de jet de l'item : celles de son porteur, plus les siennes sous
   * `@item`. Un item sans acteur ne renvoie que les siennes.
   * @returns {object}
   * @inheritdoc
   */
  getRollData() {
    const data = this.actor?.getRollData() ?? {};
    data.item = this.system.toObject(false);
    data.item.name = this.name;
    data.item.type = this.type;
    return data;
  }

  /**
   * Lance une attaque avec cette arme (via la compétence Combattre).
   * Les dés bonus/malus d'effet sont appliqués automatiquement par le jet.
   */
  async rollAttack() {
    if ( !this.actor ) throw new Error("L'arme n'est portée par aucun acteur.");
    await this.actor.rollSkill("combattre", {
      label: game.i18n.format("SD6.jets.attack", { weapon: this.name }),
      weapon: this.name
    });
  }
}
