export class StellaireItem extends Item {
  prepareDerivedData() {
    super.prepareDerivedData();
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
