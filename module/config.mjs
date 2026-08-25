const SD6 = {};

// Identifiant du systeme, tel que declare dans system.json.
SD6.id = "stellaire-d6";

SD6.title = "Stellaire D6";
// Artwork
SD6.ascii = `

 .d8888b.  888            888 888          d8b                      8888888b.   .d8888b.  
d88P  Y88b 888            888 888          Y8P                      888  "Y88b d88P  Y88b 
Y88b.      888            888 888                                   888    888 888        
 "Y888b.   888888 .d88b.  888 888  8888b.  888 888d888 .d88b.       888    888 888d888b.  
    "Y88b. 888   d8P  Y8b 888 888     "88b 888 888P"  d8P  Y8b      888    888 888P "Y88b 
      "888 888   88888888 888 888 .d888888 888 888    88888888      888    888 888    888 
Y88b  d88P Y88b. Y8b.     888 888 888  888 888 888    Y8b.          888  .d88P Y88b  d88P 
 "Y8888P"   "Y888 "Y8888  888 888 "Y888888 888 888     "Y8888       8888888P"   "Y8888P"  

`;

// Skills
SD6.skills = {
  combattre: { label: "SD6.skills.combattre", abbreviation: "SD6.skills.combattreAbr" },
  endurer: { label: "SD6.skills.endurer", abbreviation: "SD6.skills.endurerAbr" },
  sedep: { label: "SD6.skills.sedep", abbreviation: "SD6.skills.sedepAbr" },
  analyser: { label: "SD6.skills.analyser", abbreviation: "SD6.skills.analyserAbr" },
  bricoler: { label: "SD6.skills.bricoler", abbreviation: "SD6.skills.bricolerAbr" },
  survivre: { label: "SD6.skills.survivre", abbreviation: "SD6.skills.survivreAbr" },
  convaincre: { label: "SD6.skills.convaincre", abbreviation: "SD6.skills.convaincreAbr" },
  ruser: { label: "SD6.skills.ruser", abbreviation: "SD6.skills.ruserAbr" },
  resonner: { label: "SD6.skills.resonner", abbreviation: "SD6.skills.resonnerAbr" }
};

// Skill groups (domaines)
SD6.skillGroups = [
  { id: "physique", label: "SD6.skills.domaines.physique", skills: ["combattre", "endurer", "sedep"] },
  { id: "mental", label: "SD6.skills.domaines.mental", skills: ["analyser", "bricoler", "survivre"] },
  { id: "social", label: "SD6.skills.domaines.social", skills: ["convaincre", "ruser", "resonner"] }
];

// État gravité.
// `status` et `img` alimentent CONFIG.statusEffects : c'est ce qui rend un état
// visible sur le pion, et pas seulement au fond d'une fiche.
SD6.gravites = {
  leger: {
    label: "SD6.etats.gravites.leger",
    status: "sd6-etat-leger",
    img: "icons/svg/blood.svg"
  },
  serieux: {
    label: "SD6.etats.gravites.serieux",
    status: "sd6-etat-serieux",
    img: "icons/svg/hazard.svg"
  },
  grave: {
    label: "SD6.etats.gravites.grave",
    status: "sd6-etat-grave",
    img: "icons/svg/skull.svg"
  }
};

// Position d'action
SD6.positions = {
  controlee: "SD6.jets.positions.controlee",
  risquee: "SD6.jets.positions.risquee",
  desesperee: "SD6.jets.positions.desesperee"
};

// Effet d'action
SD6.effets = {
  limite: "SD6.jets.effets.limite",
  normal: "SD6.jets.effets.normal",
  puissant: "SD6.jets.effets.puissant"
};

// Types d'items
SD6.itemTypes = ["arme", "armure", "outil", "relique", "equipement"];

// Types de capacités / pouvoirs / marques (items)
SD6.abilitieTypes = ["capacite", "pouvoir", "marque"];

// Type d'Origine (item)
SD6.origineType = "origine";

// Type de Rôle (item)
SD6.roleType = "role";

// Tous les types d'items du système
SD6.allItemTypes = [...SD6.itemTypes, ...SD6.abilitieTypes, SD6.origineType, SD6.roleType];

// Nombre maximum de dés qu'un jet peut lancer (pool plafonné).
// Valeur par défaut : le réglage de monde « maxDice » fait foi en partie.
SD6.maxDice = 4;

// Formule d'initiative par défaut. Foundry utiliserait 1d20 sans cette
// déclaration, ce qui n'a pas de sens dans un système à d6.
SD6.defaultInitiative = "1d6";

// Plafond de Stress d'un personnage.
SD6.stressMax = 6;

// Types d'effets d'item (dés bonus / dés malus).
SD6.effectTypes = {
  bonus: "SD6.effets.types.bonus",
  malus: "SD6.effets.types.malus"
};

// Types d'items disposant d'un onglet « Effets ».
SD6.effectItemTypes = [
  ...["arme", "armure", "outil", "relique"],
  ...SD6.abilitieTypes,
  SD6.origineType,
  SD6.roleType
];

export default SD6;
