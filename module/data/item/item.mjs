const { SchemaField, StringField, NumberField, BooleanField, HTMLField, ArrayField } = foundry.data.fields;

/**
 * Champs communs à tous les items + champs spécifiques.
 * @param {object} [extra]  Champs additionnels propres au type d'item.
 */
function itemFields(extra = {}) {
  return {
    description: new HTMLField({ label: "SD6.item.description" }),
    bonus: new NumberField({ initial: 0, min: 0, max: 2, integer: true, label: "SD6.item.bonus" }),
    equipped: new BooleanField({ initial: false, label: "SD6.item.equipped" }),
    ...extra
  };
}

export class EquipementModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields();
  }
}

export class ArmeModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields({
      effet: new StringField({ label: "SD6.item.effet" })
    });
  }
}

export class ArmureModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields({
      protection: new StringField({ label: "SD6.item.protection" })
    });
  }
}

export class OutilModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields();
  }
}

export class ReliqueModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields({
      effet: new StringField({ label: "SD6.item.effet" })
    });
  }
}

export class CapaciteModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields();
  }
}

export class PouvoirModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields();
  }
}

export class MarqueModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return itemFields();
  }
}

export class OrigineModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ label: "SD6.item.description" }),
      bonus: new HTMLField({ label: "SD6.origine.bonus" }),
      malus: new HTMLField({ label: "SD6.origine.malus" }),
      items: new ArrayField(new StringField({ label: "SD6.origine.items" }))
    };
  }
}
