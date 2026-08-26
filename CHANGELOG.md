# Changelog

Toutes les modifications importantes de ce projet sont listées ici.

---

# Version 0.2.0 - Intégration Foundry

Date : 2026-08-25

## Ajout

- Migration de monde. Le système parcourt les documents une fois par version et persiste les corrections ; en complément, les modèles de données normalisent à la volée tout document chargé, y compris ceux qu'une migration ne voit jamais — import de compendium, copie depuis un autre monde, delta de jeton non lié.
- Le Stress devient une ressource `{ value, max }`, ce dont Foundry a besoin pour en dessiner une barre sur le pion.
- Les états apparaissent sur les jetons, sous forme d'effets de statut Foundry. Le MJ n'a plus à ouvrir chaque fiche pour savoir qui est blessé.
- Réglages de monde : plafond de la pool de dés, formule d'initiative, thème des fiches.
- `getRollData()` sur les acteurs et les items : les expressions `@skills.ruser` et `@ruser` fonctionnent dans les journaux, le chat et les formules.
- Enrichisseur `@Jet[compétence]{libellé}` : un jet cliquable s'écrit directement dans un texte.
- Glisser une compétence ou une arme sur la barre raccourcis y crée la macro correspondante.
- Surface publique `globalThis.stellaire`, sur laquelle s'appuient les macros et les modules tiers.
- Deux méthodes d'écriture des effets de dés, `actor.addSkillEffects()` et `actor.removeSkillEffects()`.
- Traduction anglaise complète.
- Icône par défaut pour chacun des dix types d'items, dossier regroupant les compendiums, préchargement des gabarits, rechargement à chaud en développement.
- Une couche de mouvement : le système n'avait qu'une seule transition déclarée et aucune animation. Les survols, les focus et les changements d'état sont désormais temporisés, et les tokens de durée et de courbe vivent dans `tokens/_motion.css` au même titre que les couleurs.
- Un jet se lit maintenant comme une scène : les dés se posent l'un après l'autre, le dé gardé s'embrase une fois les autres immobiles, le verdict monte en dernier. La réussite critique et l'échec ont chacun leur traitement, et le désavantage inverse le geste.
- La fiche met en scène ce qui change réellement : un seul pip de Stress s'allume, les lignes supprimées se replient, les zones de dépôt d'Origine et de Rôle s'éclairent pendant un glisser, un filet glisse d'un onglet à l'autre.
- Le dialogue de jet affiche la pool en direct, effets et plafond de monde compris, et montre barrés les dés que le plafond retire.
- Des dés fantômes sur chaque ligne de compétence montrent au survol ce qui partira vraiment — et, quand la pool tombe à zéro, les deux dés de désavantage.
- Réglages d'animation : le MJ fixe le plafond de sa table, chaque joueur peut descendre en dessous. La préférence système « réduire les animations » prime sur les deux.
- Traitement holographique : équerres d'angle, bande de balayage, grain, onde runique sur les boutons d'action, liseré de type sur les dix fiches d'objet, lueur réservée aux reliques et aux marques.

## Update

- La feuille de style unique est découpée en `tokens/`, `base/`, `sheets/` et `components/`, et le thème passe par des tokens de couleur, de rayon et de typographie. Aucun changement visuel : les 807 déclarations calculées sont identiques.
- Le format des effets de dés est implémenté une seule fois, dans `module/skill-effects.mjs`. La fiche d'item et l'acteur partagent désormais la même implémentation, là où le format documenté dans `docs/MODULE-API.md` était écrit deux fois.
- `SD6.gravites` porte l'identifiant de statut et l'icône de chaque gravité.
- `docs/MODULE-API.md` documente les nouvelles surfaces destinées aux modules.
- Le calcul de la pool sort de `rollSkill()` dans `actor.computeSkillPool()`, qui le rend consultable sans lancer les dés. Aucun comportement ne change et le flag `pool` du message de chat reçoit la même valeur qu'avant.
- Les champs verrouillés passent d'une opacité réduite à une hachure diagonale : « grisé » se lisait comme « cassé », et la valeur redevenait difficile à lire alors qu'elle reste pertinente.
- La transition des onglets énumère ses propriétés au lieu d'utiliser `all`, qui animait aussi le `box-shadow` à chaque survol.

## Fix

- Le tracker de combat lançait `1d20`, faute de formule déclarée, dans un système qui ne lance que des d6.
- Le Stress du pion s'affichait en valeur nue, sans jauge : `primaryTokenAttribute` pointait sur un nombre là où Foundry attend une ressource.
- Un effet portant plusieurs `changes` ne voyait que le premier pris en compte dans le calcul des dés. Chaque `change` compte désormais.
- Le libellé du champ « gravité » d'un état pointait sur une clé de traduction inexistante, `SD6.etats.gravite`, et s'affichait donc en brut.

---

# Version 0.1.5.1 - Métadonnées des jets pour modules

Date : 2026-08-25

## Ajout

- Exposition des métadonnées de jet dans les flags du ChatMessage (`flags["stellaire-d6"]`) : skill, weapon, outcome, kept, dice, pool, desavantage, stressGained, position, effet.
- Permet aux modules tiers de lire les informations structurées des jets de compétence.
- Ajout de la documentation API modules (`docs/MODULE-API.md`) : format des flags ChatMessage et des ActiveEffects pour les bonus/malus de pool.
- Ajout du getter `actor.isPlayer` : `true` si un joueur est lié à la fiche (basé sur `hasPlayerOwner`).

---

# Version 0.1.5 - Gestion des effets Item

Date : 2026-08-09

## Ajout

- Ajout d'un onglet « Effets » sur les items Armes, Armures, Outils, Reliques, Capacités, Pouvoirs, Marques, Origines et Rôles.
- Un effet définit une compétence, un type (dés bonus ou dés malus) et une valeur (nombre de dés).
- Les effets utilisent les ActiveEffects natifs de Foundry, transférés automatiquement au personnage qui possède l'item.
- Pour les items à équipement, les effets ne s'appliquent que si l'item est équipé.
- Application automatique des dés bonus/malus d'effet aux jets de compétence, sans dépasser le plafond de 4 dés.
- Ajout dans le dialogue de jet des cases à cocher pour désactiver les dés bonus/malus d'effet avant le jet.

## Update

- Passage du système en version 0.1.5.

---

# Version 0.1.4 - Compendium Identité

Date : 2026-08-08

## Ajout

- Création du compendium des Origines.
- Création du compendium des Rôles.
- Déclaration des nouveaux compendiums dans le manifest du système.

## Update

- Passage du système en version 0.1.4.

---

# Version 0.1.3 - Copies des Items d'identité

Date : 2026-08-07

## Fix

- Un Rôle ou une Origine déposé sur une fiche personnage est désormais dupliqué : une copie de l'Item est embarquée sur l'acteur, dont le propriétaire de la fiche est propriétaire.
- Le propriétaire de la fiche peut ouvrir et modifier cette copie (description, bonus, malus, objets transmis) sans impacter l'Item source utilisé pour l'attachement.
- Les objets transmis par le Rôle ou l'Origine sont également dupliqués sur l'acteur, et la copie de l'Item d'identité référence ces copies afin que le joueur accède à ses propres versions modifiables.
- Le détachement d'un Rôle ou d'une Origine supprime la copie embarquée et toutes les copies des objets transmis.

---

# Version 0.1.2 - Ajout des Rôles via Item

Date : 2026-08-05

## Ajout

- Création du type d'Item « Rôle ».
- Ajout des champs nécessaires à un Rôle : description et liste d'objets transmis (compétences, capacités, avantages).
- Intégration des Rôles dans la fiche personnage (attache, détache, remplacement).
- Automatisation de l'ajout des objets liés à un Rôle lors de l'attachement.
- Attachement d'un Rôle par glisser-déposer sur la fiche personnage.
- Remplissage des objets transmis d'un Rôle par glisser-déposer d'Items sur sa fiche.
- Gestion de la suppression ou du remplacement d'un Rôle (retrait des objets liés).

## Update

- La case « Rôle » de la fiche personnage référence désormais un Item de type Rôle au lieu d'un texte libre.
- Refactorisation du code d'attachement/détachement des Items d'identité (Origine et Rôle partagent désormais une logique commune).

---

# Version 0.1.1 - Ajout des Origines via Item

Date : 2026-08-04

## Ajout

- Création du type d'Item « Origine ».
- Ajout des champs nécessaires à une Origine : bonus enrichi, malus enrichi et liste d'objets transmis.
- Intégration des Origines dans la fiche personnage (attache, détache, remplacement).
- Automatisation de l'ajout des objets liés à une Origine lors de l'attachement.
- Attachement d'une Origine par glisser-déposer sur la fiche personnage.
- Remplissage des objets transmis d'une Origine par glisser-déposer d'Items sur sa fiche.
- Gestion de la suppression ou du remplacement d'une Origine (retrait des objets liés).

## Update

- La case « Origine » de la fiche personnage référence désormais un Item de type Origine au lieu d'un texte libre.
- Remplacement du sélecteur d'items par du glisser-déposer (fiche personnage et fiche d'Origine).

---

# Version 0.1.0 - Version fonctionnelle

Date : 2026-08-04

## Ajout

- Création du système Foundry VTT fonctionnel.
- Mise en place de la structure de base du système.
- Création des types Actor nécessaires.
- Création des types Item nécessaires.
- Mise en place de la fiche personnage.
- Implémentation des premières mécaniques de jeu.
- Ajout des premiers éléments de configuration.

## Update

- Organisation initiale du code source.
- Mise en place de la documentation du projet.

## Fix

- Correction des problèmes rencontrés durant la phase de développement initiale.

---