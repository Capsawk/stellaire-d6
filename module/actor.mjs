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
   * Attache un Item d'identité (Origine, Rôle...) au personnage.
   * L'Item d'identité et les objets transmis sont dupliqués et embarqués
   * sur l'acteur : le propriétaire de la fiche dispose ainsi de copies
   * qu'il peut ouvrir et modifier sans impacter les Items sources.
   * La référence de la copie (UUID embarqué) est enregistrée dans
   * `system.identite[field]`.
   * Si un autre Item du même type était déjà attaché, il est d'abord détaché.
   * @param {string} uuid       UUID de l'Item d'identité source.
   * @param {string} itemType   Type d'Item attendu (SD6.origineType, SD6.roleType...).
   * @param {string} field      Clé dans system.identite.
   * @param {string} flag       Nom du flag "stellaire-d6" stockant les ids créés.
   * @param {string} sourceFlag Nom du flag "stellaire-d6" stockant l'UUID source.
   * @returns {Promise<string[]>}  Identifiants des objets créés sur l'acteur.
   */
  async _attachIdentite(uuid, itemType, field, flag, sourceFlag) {
    const item = await fromUuid(uuid);
    if ( !item || item.type !== itemType ) {
      throw new Error(game.i18n.localize(`SD6.${itemType}.invalid`));
    }

    const attachedSource = this.getFlag("stellaire-d6", sourceFlag) ?? null;
    if ( attachedSource && attachedSource === uuid ) return [];

    if ( this.system.identite[field] ) await this._detachIdentite(field, flag, sourceFlag);

    const createdIds = [];

    // Copie de l'Item d'identité lui-même, embarquée sur l'acteur.
    const identityData = item.toObject();
    delete identityData._id;
    delete identityData._stats;
    const [identity] = await Item.create([identityData], { parent: this });
    createdIds.push(identity.id);

    // Copies des objets transmis, embarquées sur l'acteur.
    const newLinks = [];
    for ( const link of item.system.items ?? [] ) {
      const source = await fromUuid(link);
      if ( !source ) continue;
      const data = source.toObject();
      delete data._id;
      delete data._stats;
      const children = await Item.create([data], { parent: this });
      for ( const child of children ) {
        createdIds.push(child.id);
        newLinks.push(child.uuid);
      }
    }

    // Les objets transmis de la copie pointent vers les copies de l'acteur.
    await identity.update({ "system.items": newLinks });

    await this.update({
      [`system.identite.${field}`]: identity.uuid,
      [`flags.stellaire-d6.${flag}`]: createdIds,
      [`flags.stellaire-d6.${sourceFlag}`]: uuid
    });
    return createdIds;
  }

  /**
   * Détache l'Item d'identité du personnage et supprime la copie embarquée
   * ainsi que les objets liés.
   * @param {string} field      Clé dans system.identite.
   * @param {string} flag       Nom du flag "stellaire-d6" stockant les ids créés.
   * @param {string} sourceFlag Nom du flag "stellaire-d6" stockant l'UUID source.
   */
  async _detachIdentite(field, flag, sourceFlag) {
    const ids = this.getFlag("stellaire-d6", flag) ?? [];
    const toDelete = ids.filter(id => this.items.has(id));
    if ( toDelete.length ) await this.deleteEmbeddedDocuments("Item", toDelete);
    await this.update({
      [`system.identite.${field}`]: "",
      [`flags.stellaire-d6.${flag}`]: [],
      [`flags.stellaire-d6.${sourceFlag}`]: ""
    });
  }

  /**
   * Attache une Origine au personnage.
   * @param {string} origineUuid  UUID de l'Item de type "origine".
   * @returns {Promise<string[]>}  Identifiants des objets créés sur l'acteur.
   */
  attachOrigine(origineUuid) {
    return this._attachIdentite(origineUuid, SD6.origineType, "origine", "origineItems", "origineSource");
  }

  /**
   * Détache l'Origine du personnage et supprime les objets qui lui étaient liés.
   */
  detachOrigine() {
    return this._detachIdentite("origine", "origineItems", "origineSource");
  }

  /**
   * Attache un Rôle au personnage.
   * @param {string} roleUuid  UUID de l'Item de type "role".
   * @returns {Promise<string[]>}  Identifiants des objets créés sur l'acteur.
   */
  attachRole(roleUuid) {
    return this._attachIdentite(roleUuid, SD6.roleType, "role", "roleItems", "roleSource");
  }

  /**
   * Détache le Rôle du personnage et supprime les objets qui lui étaient liés.
   */
  detachRole() {
    return this._detachIdentite("role", "roleItems", "roleSource");
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
