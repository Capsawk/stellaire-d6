import SD6 from "./config.mjs";

/**
 * Couche de mouvement du système.
 *
 * Le CSS porte les animations ; ce module ne fait que deux choses : décider
 * du niveau effectif, et poser au bon moment les classes que les feuilles
 * attendent. Aucune valeur d'animation — durée, courbe, distance — ne doit
 * apparaître ici : elles vivent dans styles/tokens/_motion.css.
 */

/** Niveaux, du plus sobre au plus démonstratif. L'ordre porte la comparaison. */
export const MOTION_LEVELS = ["aucune", "sobre", "pleine", "spectaculaire"];

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Au-delà de cette attente, on cesse d'attendre une animation et on agit. */
const ANIMATION_TIMEOUT = 1000;

/**
 * L'utilisateur a-t-il demandé à son système de réduire les animations ?
 * Cette préférence prime sur les deux réglages : ce n'est pas un goût, c'est
 * une contrainte d'accessibilité.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia?.(REDUCED_QUERY).matches ?? false;
}

/**
 * Niveau d'animation effectif.
 *
 * Le monde fixe le plafond, le client ne peut que descendre en dessous : un
 * joueur ne peut pas s'offrir « spectaculaire » sur une table réglée en
 * « sobre ». Sans cette règle, le réglage de monde ne serait qu'une
 * suggestion, et le MJ n'aurait aucun moyen de tenir sa table.
 * @returns {string}  Une valeur de MOTION_LEVELS.
 */
export function motionLevel() {
  if ( prefersReducedMotion() ) return "aucune";
  if ( !game.settings?.settings?.has(`${SD6.id}.animations`) ) return "pleine";

  const world = game.settings.get(SD6.id, "animationsDefault");
  const client = game.settings.get(SD6.id, "animations");
  if ( client === "defaut" ) return world;

  const rank = level => MOTION_LEVELS.indexOf(level);
  return MOTION_LEVELS[Math.min(rank(world), rank(client))] ?? "pleine";
}

/**
 * Reporte le niveau effectif sur le body, où les feuilles le lisent.
 * Appelée à « ready » puis à chaque changement de réglage.
 */
export function applyMotionLevel() {
  const level = motionLevel();
  for ( const l of MOTION_LEVELS ) document.body.classList.remove(`sd6-motion-${l}`);
  document.body.classList.add(`sd6-motion-${level}`);
}

/**
 * Le mouvement est-il visible ? Sert à ne pas attendre une animation qui ne
 * se jouera pas.
 * @returns {boolean}
 */
export function motionEnabled() {
  return motionLevel() !== "aucune";
}

/**
 * Rejoue une animation ponctuelle sur un élément.
 *
 * Le retrait puis la relecture forcée du layout sont indispensables : sans
 * eux, reposer une classe déjà présente ne relance rien, et un second
 * changement de la même valeur passerait inaperçu.
 * @param {HTMLElement} element
 * @param {string} className
 */
export function flash(element, className) {
  if ( !element || !motionEnabled() ) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  element.addEventListener("animationend", () => element.classList.remove(className), { once: true });
}

/**
 * Joue une animation de sortie puis résout.
 *
 * Deux garde-fous. Le premier : si le mouvement est coupé, on résout tout de
 * suite, sinon l'action attendrait un événement qui ne viendra jamais. Le
 * second : un délai plafond, parce qu'une animation interrompue — onglet
 * masqué, élément retiré du DOM — n'émet pas animationend, et qu'une
 * suppression ne doit jamais rester en suspens pour une raison décorative.
 * @param {HTMLElement} element
 * @param {string} className
 * @returns {Promise<void>}
 */
export function animateOut(element, className) {
  if ( !element || !motionEnabled() ) return Promise.resolve();
  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if ( done ) return;
      done = true;
      resolve();
    };
    element.addEventListener("animationend", finish, { once: true });
    window.setTimeout(finish, ANIMATION_TIMEOUT);
    element.classList.add(className);
  });
}

/**
 * Numérote une série d'éléments pour que les feuilles puissent les faire
 * entrer en cascade. La variable est lue par calc() dans les animation-delay.
 * @param {Iterable<HTMLElement>} elements
 */
export function stagger(elements) {
  let i = 0;
  for ( const element of elements ) element.style.setProperty("--sd6-i", String(i++));
}

/**
 * Ce message vient-il d'arriver ?
 *
 * Le hook de rendu des messages rejoue pour tout le journal à chaque
 * rechargement de page. Sans cette garde, deux cents jets relanceraient deux
 * cents cascades de dés à chaque F5 — ce qui ne serait pas une fiche animée
 * mais une fiche inutilisable.
 * @param {ChatMessage} message
 * @returns {boolean}
 */
export function isFreshMessage(message) {
  return (Date.now() - message.timestamp) < 5000;
}

/**
 * Met en scène une carte de chat qui vient d'arriver.
 *
 * Les délais sont calculés ici parce qu'ils dépendent du nombre de dés, que
 * la feuille de style ne connaît pas : la séquence dure plus longtemps sur
 * une grosse pool, et c'est voulu — la taille du jet devient une durée.
 * @param {ChatMessage} message
 * @param {HTMLElement} html  Élément racine du message rendu.
 */
export function animateChatCard(message, html) {
  if ( !motionEnabled() || !isFreshMessage(message) ) return;

  const item = html.querySelector(".sd6-chat-item");
  if ( item ) item.classList.add("sd6-animate");

  const card = html.querySelector(".sd6-roll");
  if ( !card ) return;

  stagger(card.querySelectorAll(".sd6-tag"));
  const dice = card.querySelectorAll(".sd6-die");
  stagger(dice);

  // Le dé gardé ne s'embrase qu'une fois le dernier dé posé.
  const last = 200 + Math.max(0, dice.length - 1) * 110;
  card.style.setProperty("--sd6-ignite", `${last + 260}ms`);
  card.style.setProperty("--sd6-outcome-delay", `${last + 600}ms`);

  if ( message.getFlag(SD6.id, "desavantage") ) card.classList.add("is-desavantage");

  // L'issue est déjà dans les flags : la feuille n'a plus qu'à la lire.
  const outcome = message.getFlag(SD6.id, "outcome");
  if ( outcome === "critique" ) card.classList.add("is-crit");
  else if ( outcome === "echec" ) card.classList.add("is-echec");

  card.classList.add("sd6-animate");
}
