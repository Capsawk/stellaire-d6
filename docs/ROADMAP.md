# Roadmap

Cette roadmap présente les grandes étapes prévues pour le développement du système dans Foundry VTT.

Les dates et tâches sont indicatives et peuvent évoluer selon les besoins du projet.

---

# Version 0.1.1 - Ajout des Origines via Item

Objectif : Rajouter un Item de type Origine afin d'automatiser l'ajout de capacités correspondantes.

## Fonctionnalités

- [x] Création du type d'Item "Origine"
- [x] Ajout des champs nécessaires à une Origine
- [x] Intégration des Origines dans la fiche personnage
- [x] Automatisation de l'ajout des capacités liées à une Origine
- [x] Gestion de la suppression ou du remplacement d'une Origine
- [x] Mise à jour automatique des données du personnage lors des modifications
- [x] Ajout d'exemples d'Origines pour tests
- [x] Vérification de compatibilité avec les autres éléments du système

---

# Version 0.1.2 - Ajout des Rôles via Item

Objectif : Ajouter la gestion des Rôles sous forme d'Item afin de permettre l'attribution automatique des capacités liées correspondantes.

## Fonctionnalités

- [x] Création du type d'Item "Rôle"
- [x] Ajout des champs nécessaires à un Rôle
- [x] Intégration des Rôles dans la fiche personnage
- [x] Automatisation de l'ajout des compétences liées à un Rôle
- [x] Automatisation de l'ajout des capacités ou avantages liés à un Rôle
- [x] Gestion de la suppression ou du remplacement d'un Rôle
- [x] Mise à jour automatique des données du personnage lors des modifications
- [X] Ajout de Rôles d'exemple pour tests
- [x] Vérification de compatibilité avec les Origines

---

# Version 0.1.3 - Copies des Items d'identité

Objectif : Garantir que les Items d'identité (Origines et Rôles) attachés à une fiche personnage soient des copies dont le propriétaire de la fiche peut disposer, sans impacter les Items sources.

## Fonctionnalités

- [x] Duplication du Rôle ou de l'Origine déposé sur la fiche personnage
- [x] Copie embarquée sur l'acteur, propriété du joueur de la fiche
- [x] Édition de la copie (description, bonus, malus, objets transmis) sans impact sur l'Item source
- [x] Duplication des objets transmis par le Rôle ou l'Origine
- [x] Référencement des copies des objets transmis par l'Item d'identité de l'acteur
- [x] Détachement supprimant la copie et les objets transmis
- [x] Détection du dépôt du même Item source (pas de doublon)
- [x] Migration des fiches existantes (ancien format de référence) lors d'un nouvel attachement

---

# Version 0.1.4 - Compendium Identité

Objectif : Regrouper les éléments d'identité (Origines et Rôles) dans des compendiums pour faciliter leur réutilisation.

## Fonctionnalités

- [x] Création du compendium des Origines
- [x] Création du compendium des Rôles

---

# Version 0.1.5 - Gestion des effets Item

Objectif : Mettre en place la gestion des effets pour les Items du système.

## Fonctionnalités

- [x] Ajouter un onglet « Effets » sur les Items
- [x] Appliquer les effets au lancer de dés