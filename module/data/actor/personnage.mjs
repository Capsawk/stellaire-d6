const { SchemaField, NumberField, StringField, ArrayField, HTMLField } = foundry.data.fields;

export class PersonnageModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      identite: new SchemaField({
        origine: new StringField({ label: "SD6.identite.origine" }),
        serment: new StringField({ label: "SD6.identite.serment" }),
        role: new StringField({ label: "SD6.identite.role" }),
        niveau: new NumberField({ initial: 1, min: 1, max: 5, integer: true, label: "SD6.identite.niveau" })
      }),
      skills: new SchemaField({
        combattre: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.combattre" }),
        endurer: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.endurer" }),
        sedep: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.sedep" }),
        analyser: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.analyser" }),
        bricoler: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.bricoler" }),
        survivre: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.survivre" }),
        convaincre: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.convaincre" }),
        ruser: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.ruser" }),
        resonner: new NumberField({ initial: 0, min: 0, max: 4, integer: true, label: "SD6.skills.resonner" })
      }),
      rsc: new SchemaField({
        stress: new NumberField({ initial: 0, min: 0, max: 6, integer: true, label: "SD6.rsc.stress" })
      }),
      xp: new NumberField({ initial: 0, min: 0, integer: true, label: "SD6.xp" }),
      biographie: new HTMLField({ label: "SD6.biographie.title" }),
      notes: new HTMLField({ label: "SD6.biographie.notes" }),
      etats: new ArrayField(new SchemaField({
        label: new StringField({ label: "SD6.etats.label" }),
        gravite: new StringField({ initial: "leger", label: "SD6.etats.gravite" })
      }))
    };
  }
}
