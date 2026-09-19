/** Style de la card en mode tuiles.

Ce module existe parce que `card.ts` est hors d'atteinte du runner — il utilise
des décorateurs. Une propriété perdue dans l'assemblage ne casse ni le build ni
le typage : la photo ou la teinte disparaissent simplement à l'écran. C'est
arrivé une fois, en retirant l'accent de ce tableau.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildShellStyle } from '../src/helpers/shell.ts';

describe('buildShellStyle', () => {
  test('émet les trois propriétés quand une photo est fournie', () => {
    const style = buildShellStyle({ background: '/local/mur.jpg', overlay: 0.35, intensity: 0.88 });
    assert.match(style, /background-image:url\("\/local\/mur\.jpg"\)/);
    assert.match(style, /--esc-overlay:0\.35/);
    assert.match(style, /--esc-intensity:0\.88/);
  });

  test('sans photo, le voile et la teinte restent posés', () => {
    // Le voile ne sert à rien sans image, mais la teinte des tuiles, si : les
    // supprimer ensemble rendrait les tuiles neutres dès qu'on retire la photo.
    const style = buildShellStyle({ overlay: 0.35, intensity: 0.5 });
    assert.doesNotMatch(style, /background-image/);
    assert.match(style, /--esc-intensity:0\.5/);
  });

  test('zéro est une valeur, pas une absence', () => {
    // Voile transparent et teinte nulle sont des réglages légitimes. Un test
    // de véracité les supprimerait, et la carte reprendrait ses défauts —
    // exactement ce que l'utilisateur venait d'annuler.
    const style = buildShellStyle({ overlay: 0, intensity: 0 });
    assert.match(style, /--esc-overlay:0/);
    assert.match(style, /--esc-intensity:0/);
  });

  test('les déclarations sont séparées par des points-virgules', () => {
    const style = buildShellStyle({ background: '/local/a.jpg', overlay: 0.2, intensity: 0.9 });
    assert.equal(style.split(';').length, 3);
  });
});
