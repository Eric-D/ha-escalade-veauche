/** Tuiles calendrier, rendues dans un vrai DOM.

Le mode tuiles n'a ni titre ni compteur : ce qui s'affiche tient en trois
lignes courtes, et une erreur d'ordre ou de groupe y est invisible à la
relecture du code.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { toSession } from '../src/helpers/schedule.ts';
import { renderTile, renderTiles, renderTilesMessage } from '../src/renders/tiles.ts';
import type { Session } from '../src/types.ts';
import { mount, slot, text } from './helpers.ts';

const NOW = new Date(2026, 8, 19, 11, 56);

function session(overrides = {}): Session {
  return toSession(
    slot({ date: '2026-09-25', horaire: '19h00-20h30', weekday: 4, jour: 'Vendredi', ...overrides }),
    NOW
  )!;
}

const tile = (s: Session, opts = {}) =>
  mount(
    renderTile({
      session: s,
      showTime: false,
      showCountdown: false,
      showStatus: false,
      ...opts,
    })
  );

describe('renderTile — version minimale', () => {
  test('trois lignes : jour abrégé, numéro, mois abrégé', () => {
    const host = tile(session());
    assert.equal(text(host, '.esc-weekday'), 'ven.');
    assert.equal(text(host, '.esc-daynum'), '25');
    assert.equal(text(host, '.esc-month'), 'sept.');
  });

  test('ni horaire, ni délai, ni statut par défaut', () => {
    // Les défauts minimalistes sont la raison d'être de ce mode : c'est la
    // card la plus basse, l'utilisateur active ensuite ce qu'il veut.
    const host = tile(session());
    assert.equal(host.querySelector('.esc-time'), null);
    assert.equal(host.querySelector('.esc-bottom'), null);
  });

  test('jour et mois ne sont pas intervertis', () => {
    // Deux chaînes de même type, adjacentes : l'inversion ne se voit qu'ici.
    const host = tile(session({ date: '2026-10-03', weekday: 5 }));
    assert.equal(text(host, '.esc-weekday'), 'sam.');
    assert.equal(text(host, '.esc-month'), 'oct.');
    assert.equal(text(host, '.esc-daynum'), '3');
  });
});

describe('renderTile — mise en avant', () => {
  test('la séance du jour porte la classe today', () => {
    const host = tile(session({ date: '2026-09-19', weekday: 5 }));
    assert.ok(host.querySelector('.esc-tile.today'));
  });

  test('une séance à venir ne la porte pas', () => {
    assert.equal(tile(session()).querySelector('.esc-tile.today'), null);
  });

  test('une séance fermée est en retrait, même sans les statuts', () => {
    // Sans ça, un soir fermé serait indiscernable d'un soir ouvert dès que
    // l'utilisateur masque les statuts — c'est-à-dire par défaut.
    assert.ok(tile(session({ open: false })).querySelector('.esc-tile.closed'));
    assert.equal(tile(session({ open: true })).querySelector('.esc-tile.closed'), null);
  });
});

describe('renderTile — détails activables', () => {
  test('show_time ajoute l’horaire au format demandé', () => {
    const host = tile(session(), { showTime: true });
    assert.equal(text(host, '.esc-time'), '19h – 20h30');
  });

  test('show_countdown ajoute le délai', () => {
    const host = tile(session(), { showCountdown: true });
    assert.equal(text(host, '.esc-countdown'), 'dans 6 j');
  });

  test('show_status ajoute le point et le libellé', () => {
    const ouvert = tile(session({ open: true }), { showStatus: true });
    assert.equal(text(ouvert, '.esc-status'), 'Ouvert');
    assert.ok(ouvert.querySelector('.esc-status-dot'));
    assert.ok(ouvert.querySelector('.esc-status-open'));

    const ferme = tile(session({ open: false }), { showStatus: true });
    assert.equal(text(ferme, '.esc-status'), 'Fermé');
    assert.ok(ferme.querySelector('.esc-status-closed'));
  });

  test('un statut non reconnu n’affiche pas de pastille muette', () => {
    // Un point gris sans libellé ne dirait pas ce qu'il signifie, et la
    // couleur seule n'est jamais porteuse d'information dans cette card.
    const host = tile(session({ open: null }), { showStatus: true });
    assert.equal(host.querySelector('.esc-status'), null);
  });

  test('délai et statut partagent la ligne basse sans se remplacer', () => {
    const host = tile(session({ open: true }), { showCountdown: true, showStatus: true });
    assert.equal(text(host, '.esc-countdown'), 'dans 6 j');
    assert.equal(text(host, '.esc-status'), 'Ouvert');
  });

  test('la ligne basse existe dès qu’un seul des deux est actif', () => {
    assert.ok(tile(session(), { showCountdown: true }).querySelector('.esc-bottom'));
    assert.ok(tile(session({ open: true }), { showStatus: true }).querySelector('.esc-bottom'));
  });

  test('un horaire absent ne laisse pas de ligne vide', () => {
    const host = tile(session({ horaire: null }), { showTime: true });
    assert.equal(host.querySelector('.esc-time'), null);
  });
});

describe('renderTiles', () => {
  const trois = [
    session({ date: '2026-09-19', horaire: '10h-12h30', weekday: 5 }),
    session({ date: '2026-09-25', horaire: '19h00-20h30', weekday: 4 }),
    session({ date: '2026-10-03', horaire: '10h-12h30', weekday: 5 }),
  ];

  test('une tuile par séance', () => {
    const host = mount(
      renderTiles({ sessions: trois, columns: 3, showTime: false, showCountdown: false, showStatus: false })
    );
    assert.equal(host.querySelectorAll('.esc-tile').length, 3);
  });

  test('les colonnes suivent count, pas le nombre de séances', () => {
    // Avec deux séances pour trois tuiles demandées, la troisième colonne
    // reste vide : sans ça, les deux tuiles s'élargiraient et la card
    // changerait de densité d'un jour à l'autre.
    const host = mount(
      renderTiles({
        sessions: trois.slice(0, 2),
        columns: 3,
        showTime: false,
        showCountdown: false,
        showStatus: false,
      })
    );
    assert.equal(host.querySelectorAll('.esc-tile').length, 2);
    const grid = host.querySelector('.esc-tiles') as HTMLElement;
    assert.match(grid.getAttribute('style') ?? '', /--esc-columns:\s*3/);
  });

  test('l’ordre reçu est l’ordre rendu', () => {
    const host = mount(
      renderTiles({ sessions: trois, columns: 3, showTime: false, showCountdown: false, showStatus: false })
    );
    const jours = [...host.querySelectorAll('.esc-daynum')].map((n) => n.textContent?.trim());
    assert.deepEqual(jours, ['19', '25', '3']);
  });
});

describe('renderTilesMessage', () => {
  test('rend le texte qu’on lui donne', () => {
    assert.equal(text(mount(renderTilesMessage('Aucune séance à venir')), '.esc-tiles-empty'),
      'Aucune séance à venir');
    assert.equal(text(mount(renderTilesMessage('Créneaux indisponibles')), '.esc-tiles-empty'),
      'Créneaux indisponibles');
  });

  test('aucune tuile, donc aucune grille', () => {
    const host = mount(renderTilesMessage('Aucune séance à venir'));
    assert.equal(host.querySelector('.esc-tiles'), null);
  });
});
