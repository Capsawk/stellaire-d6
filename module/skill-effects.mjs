import SD6 from "./config.mjs";

/**
 * Contrat des « effets de dés de compétence ».
 *
 * Un effet de ce type est un ActiveEffect porté par un Item, qui ajoute ou
 * retire des dés à la pool d'une compétence. Il se reconnaît à ses `changes`,
 * dont la clé suit `system.effets.<compétence>.<bonus|malus>`, et aux flags
 * `stellaire-d6.skill` / `stellaire-d6.type` qui décrivent la même chose de
 * façon directement lisible.
 *
 * La clé volontairement distincte de `system.skills.<compétence>` — qui est un
 * simple nombre dans le schéma — évite que Foundry tente d'appliquer l'effet
 * sur une vraie donnée. Ces effets sont donc toujours créés en
 * `transfer: false` : c'est le système qui les lit, pas le moteur d'effets.
 *
 * Ce module est la seule implémentation du format. Toute lecture ou écriture
 * passe par ici, côté système comme côté module tiers.
 */

/** Racine des clés de `change` portées par ces effets. */
export const SKILL_EFFECT_KEY_ROOT = "system.effets";

/** Types d'effet reconnus. */
export const SKILL_EFFECT_TYPES = ["bonus", "malus"];

/**
 * Clé de `change` correspondant à une compétence et un type.
 * @param {string} skill  Clé de SD6.skills.
 * @param {string} type   "bonus" ou "malus".
 * @returns {string}
 */
export function skillEffectKey(skill, type) {
  return `${SKILL_EFFECT_KEY_ROOT}.${skill}.${type}`;
}

/**
 * Décompose la clé d'un `change`.
 * @param {string} key
 * @returns {{skill: string, type: string}|null}  null si la clé n'est pas du bon format.
 */
function parseSkillEffectKey(key) {
  const [root, group, skill, type] = String(key ?? "").split(".");
  if ( `${root}.${group}` !== SKILL_EFFECT_KEY_ROOT ) return null;
  if ( !skill || !type ) return null;
  return { skill, type };
}

/**
 * Lit toutes les entrées portées par un ActiveEffect.
 *
 * Chaque `change` compte pour une entrée : un effet qui modifie trois
 * compétences en produit trois. Les flags de l'effet restent prioritaires sur
 * la clé, conformément au contrat historique.
 *
 * @param {ActiveEffect} effect
 * @returns {Array<{skill: string, type: string, value: number}>}
 */
export function readSkillEffect(effect) {
  const flagSkill = effect.getFlag("stellaire-d6", "skill") ?? null;
  const flagType = effect.getFlag("stellaire-d6", "type") ?? null;
  const entries = [];

  for ( const change of effect.changes ?? [] ) {
    const parsed = parseSkillEffectKey(change.key);
    const skill = flagSkill ?? parsed?.skill ?? null;
    const type = flagType ?? parsed?.type ?? null;
    if ( !skill || !SKILL_EFFECT_TYPES.includes(type) ) continue;
    const value = Number(change.value);
    entries.push({ skill, type, value: Number.isFinite(value) ? value : 1 });
  }

  // Effet flaggé mais sans `change` exploitable : une entrée d'un dé.
  if ( !entries.length && flagSkill && SKILL_EFFECT_TYPES.includes(flagType) ) {
    entries.push({ skill: flagSkill, type: flagType, value: 1 });
  }
  return entries;
}

/**
 * Vue « une seule entrée » d'un effet, pour les formulaires de la fiche d'item
 * qui présentent un effet comme un unique couple compétence/type.
 * @param {ActiveEffect} effect
 * @returns {{skill: string|undefined, type: string|undefined, value: number}}
 */
export function readSkillEffectEntry(effect) {
  return readSkillEffect(effect)[0] ?? { skill: undefined, type: undefined, value: 1 };
}

/**
 * Nom affiché d'un effet.
 * @param {string} skill
 * @param {string} type
 * @param {number} value
 * @returns {string}
 */
export function skillEffectName(skill, type, value) {
  const sign = type === "bonus" ? "+" : "−";
  const skillLabel = game.i18n.localize(SD6.skills[skill]?.label ?? "SD6.effets.unknown");
  const typeLabel = game.i18n.localize(`SD6.effets.types.${type}`);
  return `${typeLabel} ${sign}${value} · ${skillLabel}`;
}

/**
 * Données d'ActiveEffect pour une entrée (clé, flags, nom).
 * @param {string} skill
 * @param {string} type
 * @param {number} value  Nombre de dés.
 * @returns {object}
 */
export function buildSkillEffectData(skill, type, value = 1) {
  return {
    changes: [{
      key: skillEffectKey(skill, type),
      value: String(value),
      type: "add",
      phase: "initial",
      priority: 0
    }],
    flags: { "stellaire-d6": { skill, type } },
    name: skillEffectName(skill, type, value)
  };
}
