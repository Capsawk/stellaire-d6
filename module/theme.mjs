import SD6 from "./config.mjs";

/**
 * Variante claire des feuilles du système.
 *
 * Le thème « Espace & Vikings » est nocturne, ce qui détonne pour qui utilise
 * Foundry en clair. Le basculement se fait par une classe posée sur le body :
 * la feuille tokens/_theme-light.css redéfinit alors la palette primitive, et
 * les rôles sémantiques suivent sans qu'aucune règle de composant ne bouge.
 */

const LIGHT_CLASS = "sd6-theme-light";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

/**
 * Applique le thème choisi. En mode « auto », suit la préférence du système
 * d'exploitation.
 */
export function applyTheme() {
  const mode = game.settings.get(SD6.id, "sheetTheme");
  const light = (mode === "light")
    || ((mode === "auto") && window.matchMedia(LIGHT_QUERY).matches);
  document.body.classList.toggle(LIGHT_CLASS, light);
}

/**
 * Suit les changements de préférence du système d'exploitation, pour que le
 * mode « auto » réagisse sans rechargement.
 */
export function watchSystemTheme() {
  window.matchMedia(LIGHT_QUERY).addEventListener("change", () => {
    if ( game.settings.get(SD6.id, "sheetTheme") === "auto" ) applyTheme();
  });
}
