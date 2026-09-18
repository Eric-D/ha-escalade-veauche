/** Une ligne de créneau, rendue dans un vrai DOM. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { renderSlotRow } from '../src/renders/slot-row.ts';
import { mount, slot, text } from './helpers.ts';

describe('renderSlotRow', () => {
  test('jour, date, horaire et statut sont tous rendus', () => {
    const host = mount(renderSlotRow({ slot: slot() }));
    assert.equal(text(host, '.escalade-day'), 'Mardi');
    assert.equal(text(host, '.escalade-date'), '15/09/2026');
    assert.equal(text(host, '.escalade-hours'), '19h00-21h30');
    assert.equal(text(host, '.escalade-status'), 'Ouvert');
  });

  test('jour et date ne sont pas intervertis', () => {
    // Deux chaînes de même type, adjacentes : l'inversion ne se voit qu'ici.
    const host = mount(renderSlotRow({ slot: slot({ jour: 'Samedi', date_display: '19/09/2026' }) }));
    assert.equal(text(host, '.escalade-day'), 'Samedi');
    assert.equal(text(host, '.escalade-date'), '19/09/2026');
  });

  test('un créneau sans horaire ne rend pas de ligne vide', () => {
    // Le chapeau de la page est éditorial : il a déjà été remanié, et une
    // ligne vide sous chaque date ferait croire à un rendu cassé.
    const host = mount(renderSlotRow({ slot: slot({ horaire: null }) }));
    assert.equal(host.querySelector('.escalade-hours'), null);
  });

  test('le statut fermé se distingue du statut ouvert', () => {
    const ouvert = mount(renderSlotRow({ slot: slot({ open: true }) }));
    const ferme = mount(renderSlotRow({ slot: slot({ open: false }) }));
    assert.equal(text(ouvert, '.escalade-status'), 'Ouvert');
    assert.equal(text(ferme, '.escalade-status'), 'Fermé');
    assert.ok(ouvert.querySelector('.escalade-row-open'));
    assert.ok(ferme.querySelector('.escalade-row-closed'));
  });

  test('un statut non reconnu reste visible et distinct', () => {
    const host = mount(renderSlotRow({ slot: slot({ open: null }) }));
    assert.equal(text(host, '.escalade-status'), 'Statut inconnu');
    assert.ok(host.querySelector('.escalade-row-unknown'));
  });

  test('le délai est celui du créneau, mis en avant le jour même', () => {
    assert.equal(text(mount(renderSlotRow({ slot: slot({ days_left: 0 }) })), '.escalade-delay'), "aujourd'hui");
    const today = mount(renderSlotRow({ slot: slot({ days_left: 0 }) }));
    assert.ok(today.querySelector('.escalade-delay-today'));
    const later = mount(renderSlotRow({ slot: slot({ days_left: 12 }) }));
    assert.equal(later.querySelector('.escalade-delay-today'), null);
  });
});
