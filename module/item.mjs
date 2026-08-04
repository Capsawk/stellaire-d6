export class StellaireItem extends Item {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Lance une attaque avec cette arme (via la compétence Combattre),
   * en ajoutant les dés bonus de l'arme.
   */
  async rollAttack() {
    if ( !this.actor ) throw new Error("L'arme n'est portée par aucun acteur.");
    const bonus = this.system.bonus ?? 0;
    await this.actor.rollSkill("combattre", {
      bonusDice: bonus,
      label: game.i18n.format("SD6.jets.attack", { weapon: this.name })
    });
  }
}
