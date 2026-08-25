/**
 * Acteur au nom duquel agir quand l'action ne vient pas d'une fiche : un jet
 * enrichi cliqué dans un journal, une macro de la barre raccourcis.
 *
 * L'ordre suit la convention Foundry — le pion sélectionné l'emporte sur le
 * personnage attribué à l'utilisateur, parce que c'est le geste le plus
 * récent et donc le plus intentionnel.
 *
 * @returns {Actor|null}  null si rien n'est sélectionné ni attribué.
 */
export function resolveActingActor() {
  return canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
}
