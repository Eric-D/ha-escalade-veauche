/** Classement des créneaux : statut et délai.

Ces deux fonctions pilotent le filtre de la carte. Une erreur y retire des
soirées de la liste sans rien afficher d'anormal — le type de défaut que cette
suite existe pour attraper, et le seul que ni tsc ni oxlint ne voient.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  getDelayChip,
  slotStatus,
  statusColors,
  statusLabel,
} from '../src/helpers/slot.ts';
import { slot } from './helpers.ts';

describe('slotStatus', () => {
  test('les trois états du site sont distincts', () => {
    assert.equal(slotStatus(slot({ open: true })), 'open');
    assert.equal(slotStatus(slot({ open: false })), 'closed');
    assert.equal(slotStatus(slot({ open: null })), 'unknown');
  });

  test("un statut non compris n'est jamais classé « fermé »", () => {
    // C'est l'invariant qui compte : annoncer « fermé » sur un créneau qu'on
    // n'a pas su lire envoie l'adhérent grimper ailleurs un soir d'ouverture.
    assert.notEqual(slotStatus(slot({ open: null })), 'closed');
  });
});

describe('statusColors', () => {
  test('couleur de texte et couleur de fond ne sont pas interverties', () => {
    // L'inversion donne un texte rouge sur fond rouge : illisible.
    for (const status of ['open', 'closed', 'unknown'] as const) {
      const colors = statusColors(status);
      assert.notEqual(colors.color, colors.bg, `${status} : couleurs identiques`);
    }
  });

  test('ouvert et fermé ne partagent pas leurs couleurs', () => {
    assert.notEqual(statusColors('open').color, statusColors('closed').color);
    assert.notEqual(statusColors('open').bg, statusColors('closed').bg);
  });
});

describe('statusLabel', () => {
  test('chaque statut a son libellé', () => {
    assert.equal(statusLabel('open'), 'Ouvert');
    assert.equal(statusLabel('closed'), 'Fermé');
    assert.equal(statusLabel('unknown'), 'Statut inconnu');
  });
});

describe('getDelayChip', () => {
  test('les seuils sont ceux de la mise en avant', () => {
    assert.deepEqual(
      [0, 1, 2, 7, 8].map((d) => getDelayChip(d).type),
      ['today', 'tomorrow', 'soon', 'soon', 'later']
    );
  });

  test('aujourd’hui n’est ni demain ni « dans 0 jours »', () => {
    // La frontière qu'un décalage de fuseau ferait franchir — et la raison
    // pour laquelle days_left est calculé côté Python, jamais ici.
    assert.equal(getDelayChip(0).text, "aujourd'hui");
    assert.equal(getDelayChip(1).text, 'demain');
  });

  test('un délai inconnu a son propre type', () => {
    // Sans cette garde, la carte affichait « dans undefinedj ».
    assert.equal(getDelayChip(null).type, 'unknown');
    assert.equal(getDelayChip(undefined).type, 'unknown');
    assert.equal(getDelayChip(Number.NaN).type, 'unknown');
    assert.equal(getDelayChip(Number.POSITIVE_INFINITY).type, 'unknown');
  });

  test('un créneau passé est signalé comme tel, pas comme à venir', () => {
    // Il a traversé minuit entre deux cycles : l'afficher « dans -1 jours »
    // serait absurde, et le laisser passer pour à venir serait faux.
    assert.equal(getDelayChip(-1).type, 'unknown');
    assert.equal(getDelayChip(-1).text, 'créneau passé');
  });
});
