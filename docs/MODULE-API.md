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

Le système lit également `changes[0]` comme fallback. Le format attendu :

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
