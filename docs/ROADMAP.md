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

---

# Version 0.1.5.1 - Métadonnées des jets pour modules

Objectif : Rendre les informations des jets accessibles aux modules tiers via les flags du ChatMessage.

## Fonctionnalités

- [x] Ajout des flags `stellaire-d6` dans le ChatMessage de `rollSkill()`
- [x] Exposition de skill, weapon, outcome, kept, dice, pool, desavantage, stressGained, position, effet
- [x] Documentation API modules (`docs/MODULE-API.md`) : flags ChatMessage et ActiveEffects
- [x] Getter `actor.isPlayer` pour distinguer joueurs et PNJ
- [x] Nettoyer dés bonus dans onglet général des items

---

# Version 0.2.0 - Intégration Foundry

Objectif : remplir les points d'accroche que Foundry propose et que le système
laissait vides, pour qu'il se comporte comme un système mûr, sans toucher aux
règles du jeu.

## Fonctionnalités

- [x] Mettre en place une migration de monde et une normalisation au chargement
- [x] Faire du Stress une ressource affichable en barre sur le pion
- [x] Afficher les états sur les jetons
- [x] Exposer le plafond de pool, l'initiative et le thème en réglages
- [x] Implémenter getRollData() sur les acteurs et les items
- [x] Ajouter un enrichisseur de jet pour les textes
- [x] Créer des macros au glisser-déposer
- [x] Exposer une surface publique pour les modules tiers
- [x] Découper la feuille de style et tokeniser le thème
- [x] Ajouter une variante claire du thème
- [x] Traduire le système en anglais
- [x] Icônes par type, dossier de compendiums, préchargement, rechargement à chaud
- [x] Tokeniser les durées et les courbes, et poser le garde-fou `prefers-reduced-motion`
- [x] Temporiser les survols, les focus et les états de la fiche
- [x] Mettre en scène la séquence de jet, la critique et l'échec
- [x] Signaler ce qui change : Stress, lignes ajoutées et supprimées, zones de dépôt
- [x] Afficher la pool réelle sur la fiche et dans le dialogue de jet
- [x] Exposer le niveau d'animation en réglage de table et de joueur
- [x] Traitement holographique : équerres, balayage, grain, liseré par type

## Écarté pour l'instant

- [ ] Découper `personnage.hbs` en partials — les chemins relatifs aux boucles
      casseraient silencieusement, à faire avec Foundry ouvert
- [ ] Couche de lavis sémantiques, pour que le thème clair n'ait plus à
      redéfinir la palette primitive
- [ ] Réordonnancement de l'inventaire au glisser-déposer, avec trait
      d'insertion — le seul poste du chantier graphique laissé de côté,
      parce qu'il demande une logique de tri et non de la mise en scène
- [ ] Rôles sémantiques « accent par type d'objet », pour que le liseré des
      fiches n'aille plus chercher dans la palette primitive
