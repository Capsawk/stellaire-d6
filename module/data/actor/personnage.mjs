import SD6 from "../../config.mjs";

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
        stress: new SchemaField({
          value: new NumberField({ initial: 0, min: 0, integer: true, label: "SD6.rsc.stress" }),
          max: new NumberField({ initial: SD6.stressMax, min: 1, integer: true, label: "SD6.rsc.stressMax" })
        })
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

  /**
   * Normalise les données anciennes au chargement, avant validation du schéma.
   *
   * Ce point d'accroche est appelé pour tout document, y compris ceux qu'une
   * migration de monde n'a jamais vus : import de compendium, copie depuis un
   * autre monde, delta de jeton non lié. Il complète la migration persistante
   * plutôt qu'il ne la remplace — celle-ci écrit, celui-ci rattrape.
   * @inheritdoc
   */
  static migrateData(source) {
    // 0.2.0 — rsc.stress était un nombre, il devient { value, max }.
    if ( typeof source.rsc?.stress === "number" ) {
      source.rsc.stress = { value: source.rsc.stress, max: SD6.stressMax };
    }
    return super.migrateData(source);
  }
}
