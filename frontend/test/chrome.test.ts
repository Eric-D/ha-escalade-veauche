/** En-tête, loader et bandeau de péremption, rendus dans un vrai DOM. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { renderHeader, renderLoader, renderStaleNotice } from '../src/renders/chrome.ts';
import { click, mount, text } from './helpers.ts';

describe('renderLoader', () => {
  test('rend toujours un ha-card visible', () => {
    // Un rendu vide ne donne à l'utilisateur aucune information, et c'est la
    // seule raison de cet invariant : HA n'inspecte pas le shadow root.
    const host = mount(renderLoader({ title: 'Créneaux' }));
    assert.ok(host.querySelector('ha-card'));
    assert.equal(text(host, '.escalade-title'), 'Créneaux');
  });

  test('le message par défaut ne remplace pas celui qu’on passe', () => {
    assert.equal(text(mount(renderLoader({ title: 'T' })), '.escalade-loader-text'), 'Chargement…');
    assert.equal(
      text(mount(renderLoader({ title: 'T', message: 'Indisponible' })), '.escalade-loader-text'),
      'Indisponible'
    );
  });

  test('titre et message ne sont pas intervertis', () => {
    // Deux chaînes adjacentes s'inversent sans que le typage ni le linter ne
    // disent rien : c'est précisément ce que ce test attrape.
    const host = mount(renderLoader({ title: 'Titre', message: 'Message' }));
    assert.equal(text(host, '.escalade-title'), 'Titre');
    assert.equal(text(host, '.escalade-loader-text'), 'Message');
  });
});

describe('renderStaleNotice', () => {
  test('rien à dire quand le dernier relevé a réussi', () => {
    assert.equal(mount(renderStaleNotice({ fetch_ok: true })).textContent?.trim(), '');
    assert.equal(mount(renderStaleNotice({})).textContent?.trim(), '');
  });

  test('un échec récent ne dérange pas encore', () => {
    // Le club met son calendrier à jour à la main : une heure de retard n'est
    // pas une information.
    const host = mount(
      renderStaleNotice({
        fetch_ok: false,
        last_success: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      })
    );
    assert.equal(host.textContent?.trim(), '');
  });

  test('au-delà d’une demi-journée, la carte le dit', () => {
    const host = mount(
      renderStaleNotice({
        fetch_ok: false,
        last_success: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      })
    );
    assert.match(text(host, '.escalade-stale'), /injoignable/);
  });

  test('un horodatage illisible prévient quand même', () => {
    // Sans ce cas, une date corrompue rendait le bandeau invisible : l'échec
    // le plus grave devenait le plus silencieux.
    const host = mount(renderStaleNotice({ fetch_ok: false, last_success: 'pas une date' }));
    assert.match(text(host, '.escalade-stale'), /date inconnue/);
    const sansDate = mount(renderStaleNotice({ fetch_ok: false }));
    assert.match(text(sansDate, '.escalade-stale'), /date inconnue/);
  });
});

describe('renderHeader', () => {
  test('affiche le titre et le compte', () => {
    const host = mount(
      renderHeader({ title: 'Créneaux', badgeText: '4', highlight: false })
    );
    assert.equal(text(host, '.escalade-title'), 'Créneaux');
    assert.equal(text(host, '.escalade-count'), '4');
  });

  test('le bouton de rafraîchissement n’existe que si on passe un gestionnaire', () => {
    const sans = mount(renderHeader({ title: 'T', badgeText: '0', highlight: false }));
    assert.equal(sans.querySelector('.escalade-refresh'), null);

    let called = 0;
    const avec = mount(
      renderHeader({
        title: 'T',
        badgeText: '0',
        highlight: false,
        onRefresh: () => {
          called++;
        },
      })
    );
    click(avec, '.escalade-refresh');
    assert.equal(called, 1);
  });

  test('highlight change la classe, pas le contenu', () => {
    const on = mount(renderHeader({ title: 'T', badgeText: '2', highlight: true }));
    const off = mount(renderHeader({ title: 'T', badgeText: '2', highlight: false }));
    assert.ok(on.querySelector('.escalade-count.highlight'));
    assert.equal(off.querySelector('.escalade-count.highlight'), null);
  });
});
