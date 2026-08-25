import SD6 from "../config.mjs";
import { RollSkillDialog } from "./roll-dialog.mjs";
import { animateOut, flash, motionEnabled, stagger } from "../motion.mjs";
import { maxDice } from "../settings.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CharacterActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["stellaire-d6", "actor"],
    position: { width: 800, height: 880 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      toggleLock: this._onToggleLock,
      addEtat: this._onAddEtat,
      deleteEtat: this._onDeleteEtat,
      rollSkill: this._onRollSkill,
      attackItem: this._onAttackItem,
      addItem: this._onAddItem,
      editItem: this._onEditItem,
      deleteItem: this._onDeleteItem,
      toggleEquip: this._onToggleEquip,
      addAbilitie: this._onAddAbilitie,
      editAbilitie: this._onEditAbilitie,
      deleteAbilitie: this._onDeleteAbilitie,
      chatAbilitie: this._onChatAbilitie,
      detachOrigine: this._onDetachOrigine,
      openOrigine: this._onOpenOrigine,
      chatOrigine: this._onChatOrigine,
      detachRole: this._onDetachRole,
      openRole: this._onOpenRole,
      chatRole: this._onChatRole
    }
  };

  static PARTS = {
    form: { template: "systems/stellaire-d6/templates/actor/personnage.hbs" }
  };

  static TABS = {
    "sd6-main": {
      initial: "personnage",
      tabs: [
        { id: "personnage", label: "SD6.tabs.personnage" },
        { id: "inventaire", label: "SD6.item.title" },
        { id: "biographie", label: "SD6.tabs.biographie" }
      ]
    }
  };

  /** Valeur de Stress au rendu précédent, pour n'animer que le pip qui change. */
  #lastStress = null;

  /** Identifiants d'items au rendu précédent, pour faire entrer les nouveaux. */
  #lastItemIds = null;

  /**
   * Met en scène ce qui vient de changer.
   *
   * Toute la difficulté tient en une phrase : une sheet ApplicationV2 se
   * redessine entièrement à chaque modification du document, et le formulaire
   * est en submitOnChange. Une animation posée sans discernement se rejouerait
   * donc à chaque frappe validée dans un champ. Chaque effet ci-dessous est
   * conditionné à un changement réel, constaté d'un rendu à l'autre.
   */
  _onRender(context, options) {
    super._onRender?.(context, options);
    const root = this.element;
    if ( !root ) return;

    const stress = this.document.system.rsc?.stress?.value ?? 0;
    const itemIds = new Set(this.document.items.map(i => i.id));
    const first = options?.isFirstRender ?? (this.#lastStress === null);

    this.#alignTabGlider();
    this.#watchDropZones(root);

    if ( first ) {
      // L'ouverture compose la fiche : en-tête, onglets, puis sections.
      if ( motionEnabled() ) {
        stagger(root.querySelectorAll(".sheet-body > .tab.active > section"));
        root.classList.add("sd6-entering");
        window.setTimeout(() => root.classList.remove("sd6-entering"), 900);
      }
    } else {
      // Un seul pip s'allume : celui qui vient de passer.
      if ( stress > this.#lastStress ) {
        const pips = root.querySelectorAll(".stress-pips .pip");
        flash(pips[stress - 1], "sd6-just-lit");
        flash(root.querySelector(".resource.stress .resource-value"), "sd6-bump");
      }
      // Les items apparus depuis le dernier rendu entrent par la gauche.
      for ( const id of itemIds ) {
        if ( this.#lastItemIds?.has(id) ) continue;
        for ( const row of root.querySelectorAll(`[data-item-id="${id}"]`) ) {
          flash(row, "sd6-arriving");
        }
      }
    }

    this.#lastStress = stress;
    this.#lastItemIds = itemIds;
  }

  /**
   * Place le filet sous l'onglet actif.
   *
   * Mesuré après chargement des polices : tant que la police d'affichage n'est
   * pas là, les boutons n'ont pas leur largeur définitive et le filet se pose
   * à côté.
   */
  #alignTabGlider() {
    const move = () => {
      const nav = this.element?.querySelector(".tabs");
      const glider = nav?.querySelector(".sd6-tab-glider");
      const active = nav?.querySelector(".tab-item.active");
      if ( !glider || !active ) return;
      glider.style.setProperty("--sd6-x", `${active.offsetLeft}px`);
      glider.style.setProperty("--sd6-w", `${active.offsetWidth}px`);
    };
    move();
    document.fonts?.ready.then(move);
  }

  /**
   * Éclaire les zones de dépôt d'Origine et de Rôle pendant un glisser.
   *
   * dragleave se déclenche aussi au passage sur un enfant de la zone : sans
   * compteur, la bordure clignoterait pendant tout le survol. On ne retire la
   * classe qu'une fois les entrées et les sorties revenues à égalité.
   */
  #watchDropZones(root) {
    for ( const zone of root.querySelectorAll(".origine-drop, .role-drop") ) {
      if ( zone.dataset.sd6Watched ) continue;
      zone.dataset.sd6Watched = "1";
      let depth = 0;
      const leave = () => {
        depth = 0;
        zone.classList.remove("sd6-dragover");
      };
      zone.addEventListener("dragenter", () => {
        depth += 1;
        zone.classList.add("sd6-dragover");
      });
      zone.addEventListener("dragleave", () => {
        depth -= 1;
        if ( depth <= 0 ) leave();
      });
      zone.addEventListener("drop", leave);
    }
  }

  /** Déplace le filet et fait entrer le panneau, sans toucher au sortant. */
  changeTab(tab, group, options) {
    super.changeTab(tab, group, options);
    this.#alignTabGlider();
    const panel = this.element?.querySelector(`.tab.active[data-group="${group}"]`);
    if ( !panel ) return;
    stagger(panel.querySelectorAll("section"));
    flash(panel, "sd6-tab-enter");
  }

  _getFrameButtons(options) {
    const locked = this.document.getFlag("stellaire-d6", "locked") ?? false;
    return [
      {
        action: "toggleLock",
        label: locked ? "SD6.lock.unlock" : "SD6.lock.lock",
        icon: locked ? "fa-solid fa-lock" : "fa-solid fa-lock-open"
      }
    ];
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.document;
    context.system = this.document.system;
    context.locked = this.document.getFlag("stellaire-d6", "locked") ?? false;

    context.tabActive = {};
    for ( const tab of Object.values(context.tabs ?? {}) ) {
      context.tabActive[tab.id] = tab.active;
    }

    // Le score affiché n'est pas la pool : les effets d'items s'y ajoutent, et
    // le plafond de monde la borne. Les dés fantômes montrent au survol ce qui
    // partira réellement, sans avoir à ouvrir le dialogue.
    const cap = maxDice();
    context.skillGroups = SD6.skillGroups.map(group => ({
      id: group.id,
      label: game.i18n.localize(group.label),
      skills: group.skills.map(id => {
        const value = context.system.skills[id];
        const effects = this.document.getSkillEffectDice(id);
        const pool = Math.min(value + effects.bonus - effects.malus, cap);
        const disadvantage = pool <= 0;
        return {
          id,
          label: game.i18n.localize(SD6.skills[id].label),
          value,
          poolDice: Array.from({ length: disadvantage ? 2 : pool }, (_, i) => i),
          poolDisadvantage: disadvantage,
          poolHint: disadvantage
            ? game.i18n.localize("SD6.jets.desavantage")
            : game.i18n.format("SD6.jets.poolHint", { count: pool })
        };
      })
    }));

    context.gravites = {};
    for (const [key, gravite] of Object.entries(SD6.gravites)) {
      context.gravites[key] = game.i18n.localize(gravite.label);
    }

    context.etats = context.system.etats;

    const stress = context.system.rsc.stress;
    context.stressPips = Array.from({ length: stress.max }, (_, i) => i < stress.value);
    context.stressFull = stress.value >= stress.max;

    context.abilitieTypes = {};
    for ( const type of SD6.abilitieTypes ) context.abilitieTypes[type] = game.i18n.localize(`TYPES.Item.${type}`);
    context.abilites = this.document.items
      .filter(item => SD6.abilitieTypes.includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        type: item.type,
        typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`)
      }));

    context.equipement = this.document.items
      .filter(item => item.system.equipped && ["arme", "armure"].includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        type: item.type,
        typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
        isArme: item.type === "arme"
      }));

    context.itemTypes = {};
    for ( const type of SD6.itemTypes ) context.itemTypes[type] = game.i18n.localize(`TYPES.Item.${type}`);
    context.inventory = this.document.items
      .filter(item => !SD6.abilitieTypes.includes(item.type)
        && ![SD6.origineType, SD6.roleType].includes(item.type))
      .map(item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        type: item.type,
        typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
        equipped: item.system.equipped ?? false,
        isArme: item.type === "arme"
      }));

    context.origine = await this._prepareIdentiteEntry("origine");
    context.role = await this._prepareIdentiteEntry("role");

    context.system.biographieEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.biographie ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    context.system.notesEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.system.notes ?? "",
      { secrets: this.document.isOwner, documents: true }
    );

    return context;
  }

  /**
   * Prépare l'entrée d'identité (Origine, Rôle...) liée au personnage.
   * @param {string} field  Clé dans system.identite.
   * @returns {Promise<object|null>}  Données d'affichage ou null si aucune entrée.
   */
  async _prepareIdentiteEntry(field) {
    const uuid = this.document.system.identite[field] ?? "";
    if ( !uuid ) return null;
    const item = await fromUuid(uuid);
    if ( !item ) return null;
    return { uuid, name: item.name, img: item.img };
  }

  static async _onToggleLock(event, target) {
    const locked = this.document.getFlag("stellaire-d6", "locked") ?? false;
    await this.document.setFlag("stellaire-d6", "locked", !locked);
    this.render();
  }

  static async _onAddEtat(event, target) {
    const etats = foundry.utils.duplicate(this.document.system.etats);
    etats.push({ label: "", gravite: "leger" });
    await this.document.update({ "system.etats": etats });
  }

  static async _onDeleteEtat(event, target) {
    const index = Number(target.dataset.index);
    const etats = foundry.utils.duplicate(this.document.system.etats);
    etats.splice(index, 1);
    const row = target.closest(".etat");
    if ( row?.classList.contains("sd6-leaving") ) return;
    await animateOut(row, "sd6-leaving");
    try {
      await this.document.update({ "system.etats": etats });
    } catch ( err ) {
      row?.classList.remove("sd6-leaving");
      throw err;
    }
  }

  static async _onAddAbilitie(event, target) {
    const type = this.element.querySelector('select[name="abilitieType"]').value;
    const name = game.i18n.localize(`TYPES.Item.${type}`);
    await Item.create({ name, type }, { parent: this.document });
  }

  static async _onEditAbilitie(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    item.sheet.render(true);
  }

  static async _onDeleteAbilitie(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await CharacterActorSheet.#deleteRow(item, target.closest(".item"));
  }

  static async _onChatAbilitie(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      item.system.description ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    const content = await foundry.applications.handlebars.renderTemplate("systems/stellaire-d6/templates/chat/item.hbs", {
      name: item.name,
      img: item.img,
      typeLabel: game.i18n.localize(`TYPES.Item.${item.type}`),
      description
    });
    const messageData = {
      content,
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flags: { "core": { "canPopout": true } }
    };
    ChatMessage.applyMode(messageData, game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);
  }

  static async _onRollSkill(event, target) {
    const skillId = target.dataset.skill;
    const label = game.i18n.localize(SD6.skills[skillId].label);
    new RollSkillDialog(this.document, skillId, {
      window: { title: game.i18n.format("SD6.jets.skillTitle", { skill: label }) }
    }).render(true);
  }

  static async _onAttackItem(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await item.rollAttack();
  }

  static async _onAddItem(event, target) {
    const type = this.element.querySelector('select[name="itemType"]').value;
    const name = game.i18n.localize(`TYPES.Item.${type}`);
    const equipped = ["arme", "armure", "relique"].includes(type);
    await Item.create({ name, type, system: { equipped } }, { parent: this.document });
  }

  static async _onEditItem(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    item.sheet.render(true);
  }

  static async _onDeleteItem(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await CharacterActorSheet.#deleteRow(item, target.closest(".item"));
  }

  /**
   * Fait sortir la ligne avant de supprimer le document.
   *
   * Si la suppression échoue — droits insuffisants, document déjà parti — la
   * ligne est remise dans son état normal : rien ne doit rester à l'écran en
   * cours de disparition pour une action qui n'a pas eu lieu.
   * @param {Item} item
   * @param {HTMLElement|null} row
   */
  static async #deleteRow(item, row) {
    if ( !item || row?.classList.contains("sd6-leaving") ) return;
    await animateOut(row, "sd6-leaving");
    try {
      await item.delete();
    } catch ( err ) {
      row?.classList.remove("sd6-leaving");
      throw err;
    }
  }

  static async _onToggleEquip(event, target) {
    const item = this.document.items.get(target.dataset.itemId);
    await item.update({ "system.equipped": target.checked });
  }

  async _onDragStart(event) {
    await super._onDragStart(event);
    const target = event.currentTarget;
    if ( target.dataset.uuid ) {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        type: "Item",
        uuid: target.dataset.uuid
      }));
    }
    // Une compétence n'est pas un document : elle voyage sous un type propre au
    // système, que le hook hotbarDrop sait reconnaître.
    if ( target.dataset.skill ) {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        type: "sd6.skill",
        actorUuid: this.document.uuid,
        skill: target.dataset.skill
      }));
    }
  }

  /**
   * Autorise le dépôt sur la fiche uniquement si elle est déverrouillée.
   * @override
   */
  _canDragDrop(selector) {
    return super._canDragDrop(selector)
      && !(this.document.getFlag("stellaire-d6", "locked") ?? false);
  }

  /**
   * Dépose d'un document sur la fiche personnage.
   * Un Item de type « Origine » ou « Rôle » est attaché au personnage,
   * les autres documents sont traités par le comportement par défaut.
   * @override
   */
  async _onDropDocument(event, document) {
    if ( document.documentName === "Item" ) {
      if ( document.type === SD6.origineType ) {
        if ( this.document.getFlag("stellaire-d6", "origineSource") === document.uuid ) return null;
        await this.document.attachOrigine(document.uuid);
        this.render();
        return document;
      }
      if ( document.type === SD6.roleType ) {
        if ( this.document.getFlag("stellaire-d6", "roleSource") === document.uuid ) return null;
        await this.document.attachRole(document.uuid);
        this.render();
        return document;
      }
    }
    return super._onDropDocument(event, document);
  }

  static async _onDetachOrigine(event, target) {
    await this.document.detachOrigine();
    this.render();
  }

  static async _onOpenOrigine(event, target) {
    const origine = await fromUuid(this.document.system.identite.origine);
    origine?.sheet.render(true);
  }

  static async _onChatOrigine(event, target) {
    const origine = await fromUuid(this.document.system.identite.origine);
    if ( !origine ) return;
    const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      origine.system.description ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    const bonus = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      origine.system.bonus ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    const malus = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      origine.system.malus ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    const content = await foundry.applications.handlebars.renderTemplate("systems/stellaire-d6/templates/chat/origine.hbs", {
      name: origine.name,
      img: origine.img,
      typeLabel: game.i18n.localize(`TYPES.Item.${origine.type}`),
      description,
      bonus,
      malus
    });
    const messageData = {
      content,
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flags: { "core": { "canPopout": true } }
    };
    ChatMessage.applyMode(messageData, game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);
  }

  static async _onDetachRole(event, target) {
    await this.document.detachRole();
    this.render();
  }

  static async _onOpenRole(event, target) {
    const role = await fromUuid(this.document.system.identite.role);
    role?.sheet.render(true);
  }

  static async _onChatRole(event, target) {
    const role = await fromUuid(this.document.system.identite.role);
    if ( !role ) return;
    const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      role.system.description ?? "",
      { secrets: this.document.isOwner, documents: true }
    );
    const content = await foundry.applications.handlebars.renderTemplate("systems/stellaire-d6/templates/chat/role.hbs", {
      name: role.name,
      img: role.img,
      typeLabel: game.i18n.localize(`TYPES.Item.${role.type}`),
      description
    });
    const messageData = {
      content,
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flags: { "core": { "canPopout": true } }
    };
    ChatMessage.applyMode(messageData, game.settings.get("core", "rollMode"));
    await ChatMessage.create(messageData);
  }
}
