export class StellaireItem extends Item {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Lance une attaque avec cette arme (via la compétence Combattre).
   * Les dés bonus/malus d'effet sont appliqués automatiquement par le jet.
   */
  async rollAttack() {
    if ( !this.actor ) throw new Error("L'arme n'est portée par aucun acteur.");
    await this.actor.rollSkill("combattre", {
      label: game.i18n.format("SD6.jets.attack", { weapon: this.name })
    });
  }
}
