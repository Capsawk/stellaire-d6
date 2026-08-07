# Changelog

Toutes les modifications importantes de ce projet sont listées ici.

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