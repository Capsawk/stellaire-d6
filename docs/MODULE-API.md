# API Modules - Stellaire D6

Ce document décrit les contrats de données exposés par le système Stellaire D6, à destination des développeurs de modules tiers.

---

## Flags des jets de compétence (ChatMessage)

Lorsqu'un personnage lance un jet de compétence (`rollSkill()`), le système crée un `ChatMessage` dont les flags contiennent les métadonnées du jet.

### Emplacement

```
message.flags["stellaire-d6"]
```

### Champs

| Champ            | Type           | Description                                                                 |
|------------------|----------------|-----------------------------------------------------------------------------|
| `skill`          | `string`       | Identifiant de la compétence lancée (ex. `"combattre"`, `"resonner"`)       |
| `weapon`         | `string \| null`| Nom de l'arme si jet d'attaque, `null` sinon                               |
| `outcome`        | `string`       | Résultat du jet : `"critique"`, `"net"`, `"complication"` ou `"echec"`     |
| `kept`           | `number`       | Valeur du dé conservé (le meilleur ou le pire selon désavantage)           |
| `dice`           | `number[]`     | Tableau de toutes les valeurs obtenues sur les dés lancés                  |
| `pool`           | `number`       | Nombre de dés dans la pool (avant conservation)                            |
| `desavantage`    | `boolean`      | `true` si la pool était ≤ 0 (2d6, on garde le pire)                       |
| `stressGained`   | `boolean`      | `true` si un dé de stress a été ajouté au jet                              |
| `position`       | `string`       | Position de l'action : `"controlee"`, `"risquee"` ou `"desesperee"`        |
| `effet`          | `string`       | Effet de l'action : `"limite"`, `"normal"` ou `"puissant"`                 |

### IDs de compétences valides

`combattre`, `endurer`, `sedep`, `analyser`, `bricoler`, `survivre`, `convaincre`, `ruser`, `resonner`

### Exemple

```js
const flag = message.flags["stellaire-d6"];
// Jet classique : { skill: "resonner", weapon: null, outcome: "net", kept: 5, dice: [3, 5, 2], pool: 3, desavantage: false, stressGained: false, position: "risquee", effet: "normal" }
// Attaque :       { skill: "combattre", weapon: "Sabre laser", outcome: "net", kept: 5, dice: [3, 5, 2], pool: 3, desavantage: false, stressGained: false, position: "risquee", effet: "normal" }
```

---

## Flags des ActiveEffects (bonus/malus de pool)

Le système lit les ActiveEffects portés par les items d'un personnage pour ajuster la taille de la pool de dés lors des jets. Un module peut créer des items avec des ActiveEffects flaggées pour modifier les pools.

### Format des flags

Chaque ActiveEffect doit porter les flags suivants :

| Champ    | Type     | Valeurs attendues         | Description                      |
|----------|----------|---------------------------|----------------------------------|
| `skill`  | `string` | ID de compétence valide   | Compétence ciblée par l'effet    |
| `type`   | `string` | `"bonus"` ou `"malus"`    | Direction de l'effet sur la pool |

Emplacement : `effect.flags["stellaire-d6"]`

### Format des changes

**Chaque `change` compte pour une entrée.** Un effet qui modifie trois compétences
en produit trois. Lorsque les flags de l'effet sont présents, ils l'emportent sur la
clé du `change` ; sinon la clé est décomposée pour retrouver compétence et type.

Le format attendu :

| Champ   | Valeur                                    | Description                          |
|---------|-------------------------------------------|--------------------------------------|
| `key`   | `"system.effets.<skill>.<type>"`          | Clé structurée (ex. `"system.effets.combattre.bonus"`) |
| `value` | `string` (nombre, ex. `"1"`)              | Nombre de dés bonus ou malus         |
| `type`  | `"add"`                                   | Type de modification                 |
| `phase` | `"initial"`                               | Phase d'application                  |

### Contraintes sur l'item

- Le type de l'item doit faire partie des types supportés : `arme`, `armure`, `outil`, `relique`, `capacite`, `pouvoir`, `marque`, `origine`, `role`
- Si l'item possède un champ `equipped`, il doit être `true` pour que ses effets soient pris en compte
- L'effet ne doit pas être désactivé (`effect.disabled === false`)

### Exemple de création

```js
await ActiveEffect.create([{
  name: "Malus -1 · Combattre",
  icon: "icons/svg/sword.svg",
  transfer: false,
  changes: [{
    key: "system.effets.combattre.malus",
    value: "1",
    type: "add",
    phase: "initial",
    priority: 0
  }],
  flags: {
    "stellaire-d6": {
      skill: "combattre",
      type: "malus"
    }
  }
}], { parent: item });
```

### Lecture par le système

```js
const effects = actor.getSkillEffectDice("combattre");
// { bonus: 1, malus: 2, sources: [{ name: "Bouclier", type: "bonus", value: 1 }, ...] }
```

### Écriture assistée

Reproduire le format à la main reste possible — c'est ce que montre l'exemple
ci-dessus — mais l'acteur expose deux méthodes qui s'en chargent, et qui restent
alignées sur le format quoi qu'il devienne.

```js
await actor.addSkillEffects(
  [
    { skill: "combattre", type: "bonus", value: 1 },
    { skill: "ruser", type: "malus", value: 1 }
  ],
  { name: "Fureur du Bifrost", source: "mon-module" }
);
```

| Paramètre | Description |
|---|---|
| `entries` | Une entrée, ou un tableau d'entrées `{ skill, type, value }`. `value` vaut 1 par défaut. |
| `options.name` | Nom de l'item porteur créé sur l'acteur. |
| `options.itemType` | Type de l'item porteur, `capacite` par défaut. |
| `options.source` | Identifiant libre de l'appelant, stocké en flag pour permettre un retrait ciblé. |

L'item porteur est créé équipé, donc visible et supprimable depuis la fiche comme
n'importe quel autre effet du système.

```js
await actor.removeSkillEffects("mon-module");
// retire tous les items d'effets posés par cette source, et retourne leurs identifiants
```

Le format lui-même est implémenté une seule fois, dans `module/skill-effects.mjs`.
Un module qui préfère construire ses effets lui-même peut en importer les fonctions
plutôt que recopier la structure :

```js
import { buildSkillEffectData, readSkillEffect } from "./skill-effects.mjs";
```

---

## Identification joueur / PNJ

Le système ne distingue pas les types d'acteur (personnage, pnj, creature...). Pour différencier un personnage joueur d'un PNJ, utilisez le getter `isPlayer` sur l'acteur :

```js
actor.isPlayer  // true si un utilisateur avec le rôle joueur possède la fiche
```

Ce getter est un raccourci vers `actor.hasPlayerOwner` de Foundry VTT. Il est calculé à la volée et ne stocke rien en base.

### Exemple d'usage

```js
const actors = game.actors.filter(a => a.isPlayer);
// Tous les acteurs liés à un joueur

---

## Point d'entrée : `globalThis.stellaire`

Le système expose une surface publique. Elle est plus stable que les chemins de
fichiers, qui peuvent bouger d'une version à l'autre.

```js
stellaire.SD6            // configuration : compétences, domaines, types d'items
stellaire.skillEffects   // lecture et écriture du format d'effets décrit plus haut
stellaire.rollSkillMacro // ouvre le dialogue de jet pour l'acteur courant
stellaire.rollItemMacro  // lance l'attaque d'une arme, par UUID
stellaire.documents      // { StellaireActor, StellaireItem }
```

---

## Données de jet

`Actor#getRollData()` et `Item#getRollData()` alimentent les expressions `@` de
Foundry. Les compétences sont exposées deux fois : sous leur chemin de schéma, et
sous un alias court.

```js
const data = actor.getRollData();
data.skills.combattre   // 3
data.combattre          // 3, alias
data.stress             // 2
data.stressMax          // 6
data.niveau             // 1
data.maxDice            // plafond de pool en vigueur
```

Ce qui rend ceci fonctionnel dans un journal ou en chat :

```
[[/r 1d6 + @combattre]]
```

Sur un item, les données du porteur sont complétées par `@item`.

---

## Jets cliquables dans un texte

L'enrichisseur `@Jet[compétence]{libellé}` transforme du texte en jet cliquable,
partout où Foundry enrichit du contenu — journaux, descriptions d'items, chat.

```
Une porte scellée. @Jet[bricoler] pour l'ouvrir.
@Jet[resonner]{Écouter le Bifrost} avant qu'il ne soit trop tard.
```

Le jet est lancé par le pion sélectionné, à défaut par le personnage attribué à
l'utilisateur. Une compétence inconnue laisse le texte intact plutôt que de
produire un lien mort.

---

## États et pions

Les trois gravités d'état sont enregistrées comme effets de statut Foundry :

| Gravité | Identifiant de statut |
|---|---|
| Léger | `sd6-etat-leger` |
| Sérieux | `sd6-etat-serieux` |
| Grave | `sd6-etat-grave` |

```js
const gravementBlesse = actor.statuses.has("sd6-etat-grave");
```

La synchronisation va de la fiche vers le pion. `system.etats` fait foi : poser
ou retirer le statut directement ne modifie pas la fiche, et sera écrasé à la
prochaine modification de celle-ci.

---

## Versions de données

Le système migre les mondes qu'il ouvre. Deux conséquences pour un module :

- `game.settings.get("stellaire-d6", "worldVersion")` indique la version de
  données du monde. Elle peut être en retard sur `game.system.version` pendant le
  tout premier chargement.
- Les modèles de données normalisent les formats anciens au chargement. Un
  document lu via l'API a donc toujours la forme courante, même s'il n'a jamais
  été migré sur disque. C'est notamment le cas de `system.rsc.stress`, qui était
  un nombre avant la 0.2.0 et qui est désormais `{ value, max }`.
