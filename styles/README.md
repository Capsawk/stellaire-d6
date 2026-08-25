# Feuilles de style

Le thème est découpé par responsabilité. L'ordre de chargement est déclaré
dans `system.json` (`styles`) et suit celui de ce tableau.

| Dossier | Contenu |
|---|---|
| `tokens/` | Les valeurs du thème, et rien d'autre. `_palette.css` porte les couleurs brutes, `_semantic.css` les rôles (surface, texte, bordure, issue de jet) et les échelles. |
| `base/` | Ce qui s'applique à tout le système : couleur de texte héritée, champs de formulaire communs. |
| `sheets/` | Une feuille par fenêtre : fiche de personnage, fiche d'item, dialogue de jet. |
| `components/` | Éléments réutilisables hors fenêtre — les cartes de chat. |

## Deux règles

**Ne pas écrire de couleur en dur.** Passer par un rôle de `_semantic.css`.
Pour une variante translucide, utiliser les canaux de la palette plutôt que de
recomposer la teinte :

```css
/* non */   border-color: rgba(227, 180, 94, 0.35);
/* oui */   border-color: rgb(var(--sd6-c-gold-500-rgb) / 0.35);
```

**Ne pas ajouter de token sans usage.** Les échelles décrivent ce que la
feuille utilise réellement ; c'est ce qui les garde honnêtes.
