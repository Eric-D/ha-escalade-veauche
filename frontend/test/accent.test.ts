/** Couleurs d'accent : normalisation et choix par statut.

Une erreur ici ne lève pas : la propriété personnalisée est simplement absente
ou invalide, `color-mix` retombe sur son repli, et la tuile garde une couleur
plausible. C'est-à-dire qu'un accent qui ne s'applique jamais ressemble à un
accent qui s'applique — d'où ces tests.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DEFAULT_ACCENTS, accentFor, normalizeColor } from '../src/helpers/accent.ts';

describe('normalizeColor — sélecteur de couleur', () => {
  test('convertit le triplet renvoyé par color_rgb', () => {
    assert.equal(normalizeColor([76, 175, 80]), 'rgb(76, 175, 80)');
    assert.equal(normalizeColor([0, 0, 0]), 'rgb(0, 0, 0)');
    assert.equal(normalizeColor([255, 255, 255]), 'rgb(255, 255, 255)');
  });

  test('rejette un triplet hors bornes ou mal formé', () => {
    // Un canal à 300 produirait une couleur que le navigateur ignore, donc une
    // tuile qui retombe sur son repli sans que rien ne le dise.
    assert.equal(normalizeColor([300, 0, 0]), undefined);
    assert.equal(normalizeColor([-1, 0, 0]), undefined);
    assert.equal(normalizeColor([1, 2]), undefined);
    assert.equal(normalizeColor([1, 2, 3, 4]), undefined);
    assert.equal(normalizeColor([1.5, 2, 3]), undefined);
  });
});

describe('normalizeColor — chaînes CSS', () => {
  test('laisse passer les formes utiles', () => {
    for (const value of ['var(--success-color)', '#4caf50', 'rgb(1, 2, 3)', 'teal']) {
      assert.equal(normalizeColor(value), value, value);
    }
  });

  test('coupe les espaces de bord', () => {
    assert.equal(normalizeColor('  #4caf50  '), '#4caf50');
  });

  test('refuse ce qui permettrait de sortir de la déclaration', () => {
    // La valeur part dans une propriété personnalisée que color-mix consomme :
    // un point-virgule ou une accolade y refermerait la déclaration.
    assert.equal(normalizeColor('red; background: url(http://ailleurs)'), undefined);
    assert.equal(normalizeColor('red} .autre-carte {display:none'), undefined);
    assert.equal(normalizeColor('<script>'), undefined);
    assert.equal(normalizeColor('a'.repeat(200)), undefined);
  });

  test('l’absence de valeur reste l’absence de valeur', () => {
    // undefined, et non une couleur par défaut : c'est accentFor qui décide du
    // repli, et lui seul connaît le statut.
    for (const value of [undefined, null, '', 42, {}]) {
      assert.equal(normalizeColor(value), undefined, String(value));
    }
  });
});

describe('accentFor', () => {
  test('sans réglage, les jetons du thème', () => {
    assert.equal(accentFor('open', {}), 'var(--success-color)');
    assert.equal(accentFor('closed', {}), 'var(--error-color)');
    assert.equal(accentFor('unknown', {}), 'var(--primary-color)');
  });

  test('les défauts sont des var(), pas des hexadécimaux', () => {
    // Figer #4caf50 ferait que la carte cesse de suivre le thème de
    // l'utilisateur — ce que les jetons existent pour éviter.
    for (const value of Object.values(DEFAULT_ACCENTS)) {
      assert.match(value, /^var\(--/);
    }
  });

  test('chaque statut prend son réglage, et seulement le sien', () => {
    const config = { open: '#00ff00', closed: '#ff0000' };
    assert.equal(accentFor('open', config), '#00ff00');
    assert.equal(accentFor('closed', config), '#ff0000');
  });

  test('régler un statut ne déteint pas sur l’autre', () => {
    assert.equal(accentFor('closed', { open: '#00ff00' }), 'var(--error-color)');
    assert.equal(accentFor('open', { closed: '#ff0000' }), 'var(--success-color)');
  });

  test('le statut non reconnu n’est pas configurable', () => {
    // Lui donner une couleur choisie inviterait à le lire comme une troisième
    // catégorie de créneau, alors qu'il ne dit rien du club.
    assert.equal(accentFor('unknown', { open: '#00ff00', closed: '#ff0000' }), 'var(--primary-color)');
  });
});
