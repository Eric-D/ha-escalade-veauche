/** Construction des séances : horaires, jours civils, filtrage du passé.

Tout ce qui est testé ici échoue en silence en production. Une séance qui reste
affichée après son horaire, un « dans 6 j » qui saute un jour au changement
d'heure, un mois abrégé faux : rien ne lève, rien n'apparaît dans la console,
et la card a l'air de marcher.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  MONTH_SHORT,
  WEEKDAY_SHORT,
  civilDaysBetween,
  countdownLabel,
  formatTimeRange,
  parseTimeRange,
  sessionAriaLabel,
  toSession,
  upcomingSessions,
} from '../src/helpers/schedule.ts';
import { slot } from './helpers.ts';

/** 19 septembre 2026, 11 h 56, heure locale — l'instant du critère d'acceptation. */
const NOW = new Date(2026, 8, 19, 11, 56);

describe('parseTimeRange', () => {
  test('lit les deux formes publiées par le club', () => {
    assert.deepEqual(parseTimeRange('19h00-21h30'), { start: 19 * 60, end: 21 * 60 + 30 });
    assert.deepEqual(parseTimeRange('10h-12h30'), { start: 10 * 60, end: 12 * 60 + 30 });
  });

  test('tolère les espaces et les trois tirets', () => {
    const expected = { start: 19 * 60, end: 20 * 60 + 30 };
    assert.deepEqual(parseTimeRange('19 h 00 – 20 h 30'), expected);
    assert.deepEqual(parseTimeRange('19h00 — 20h30'), expected);
    assert.deepEqual(parseTimeRange('19h00 - 20h30'), expected);
  });

  test('un horaire absent ou illisible ne vaut pas minuit', () => {
    // 0 serait une plage valide commençant à minuit : la séance disparaîtrait
    // dès la première minute de la journée.
    for (const value of [null, undefined, '', 'sur inscription', '25h-26h', '10h70-12h']) {
      assert.equal(parseTimeRange(value as string), null, String(value));
    }
  });

  test('une fin avant le début est rejetée', () => {
    assert.equal(parseTimeRange('21h-19h'), null);
    assert.equal(parseTimeRange('19h-19h'), null);
  });
});

describe('formatTimeRange', () => {
  test('les heures pleines perdent leurs minutes', () => {
    assert.equal(formatTimeRange(parseTimeRange('19h00-20h30')), '19h – 20h30');
    assert.equal(formatTimeRange(parseTimeRange('10h-12h30')), '10h – 12h30');
  });

  test('les minutes non nulles sont sur deux chiffres', () => {
    assert.equal(formatTimeRange(parseTimeRange('9h05-10h00')), '9h05 – 10h');
  });

  test('sans plage, pas de libellé', () => {
    assert.equal(formatTimeRange(null), null);
  });
});

describe('civilDaysBetween', () => {
  test('compte des jours civils, pas des tranches de 24 heures', () => {
    // 23 h 50 à 00 h 10 fait vingt minutes et pourtant un jour.
    assert.equal(
      civilDaysBetween(new Date(2026, 8, 19, 23, 50), new Date(2026, 8, 20, 0, 10)),
      1
    );
  });

  test('survit au changement d’heure', () => {
    // Nuit du 24 au 25 octobre 2026 : 25 heures en Europe/Paris. Une division
    // par 86 400 000 donnerait 1,04 puis 1 par troncature, mais la nuit
    // inverse en donnerait 0,96 — donc 0, et « demain » afficherait
    // « aujourd'hui ».
    assert.equal(civilDaysBetween(new Date(2026, 9, 24, 12), new Date(2026, 9, 25, 12)), 1);
    assert.equal(civilDaysBetween(new Date(2026, 2, 28, 12), new Date(2026, 2, 29, 12)), 1);
  });

  test('le passé est négatif', () => {
    assert.equal(civilDaysBetween(new Date(2026, 8, 19), new Date(2026, 8, 17)), -2);
  });
});

describe('toSession', () => {
  test('la date civile n’est pas interprétée en UTC', () => {
    // new Date('2026-09-19') vaut le 18 à 22 h à Paris : la séance changerait
    // de jour, et le numéro affiché sur la tuile serait celui de la veille.
    const session = toSession(slot({ date: '2026-09-19', horaire: '10h-12h30' }), NOW)!;
    assert.equal(session.dayOfMonth, 19);
    assert.equal(session.month, 8);
  });

  test('ignore un days_left périmé et recompte localement', () => {
    // L'exception documentée du mode tuiles. L'intégration ne relève le
    // calendrier qu'une fois par heure : à 00 h 05, son days_left dit encore
    // « 1 » pour la séance de ce soir. S'y fier ferait afficher « demain »
    // sur une séance du jour même jusqu'au relevé suivant, alors que la card
    // se rafraîchit, elle, chaque minute.
    const session = toSession(slot({ date: '2026-09-25', days_left: 99 }), NOW)!;
    assert.equal(session.daysUntil, 6);
  });

  test('bascule à minuit sans nouvelle donnée', () => {
    const veille = toSession(slot({ date: '2026-09-20', days_left: 1 }), new Date(2026, 8, 19, 23, 50))!;
    const apres = toSession(slot({ date: '2026-09-20', days_left: 1 }), new Date(2026, 8, 20, 0, 5))!;
    assert.equal(countdownLabel(veille), 'demain');
    assert.equal(countdownLabel(apres), "aujourd'hui");
  });

  test('« en cours » tient à la minute', () => {
    const during = toSession(slot({ date: '2026-09-19', horaire: '10h-12h30' }), NOW)!;
    assert.equal(during.isNow, true);
    assert.equal(during.isToday, true);

    const after = toSession(
      slot({ date: '2026-09-19', horaire: '10h-12h30' }),
      new Date(2026, 8, 19, 12, 31)
    )!;
    assert.equal(after.isNow, false);

    const before = toSession(
      slot({ date: '2026-09-19', horaire: '10h-12h30' }),
      new Date(2026, 8, 19, 9, 59)
    )!;
    assert.equal(before.isNow, false);
  });

  test('sans horaire, la séance n’est jamais « en cours »', () => {
    const session = toSession(slot({ date: '2026-09-19', horaire: null }), NOW)!;
    assert.equal(session.isNow, false);
    assert.equal(session.end, null);
  });

  test('le statut du créneau devient celui de la séance', () => {
    assert.equal(toSession(slot({ open: true }), NOW)!.status, 'open');
    assert.equal(toSession(slot({ open: false }), NOW)!.status, 'closed');
    assert.equal(toSession(slot({ open: null }), NOW)!.status, 'unknown');
  });

  test('une date illisible ne produit pas de séance', () => {
    assert.equal(toSession(slot({ date: 'pas une date' }), NOW), null);
  });
});

describe('countdownLabel', () => {
  const label = (date: string, days: number, horaire: string | null, now = NOW): string =>
    countdownLabel(toSession(slot({ date, days_left: days, horaire }), now)!);

  test('les quatre libellés de la spécification', () => {
    assert.equal(label('2026-09-19', 0, '10h-12h30'), 'en cours');
    assert.equal(label('2026-09-19', 0, '19h-21h'), "aujourd'hui");
    assert.equal(label('2026-09-20', 1, null), 'demain');
    assert.equal(label('2026-09-25', 6, null), 'dans 6 j');
    assert.equal(label('2026-10-03', 14, null), 'dans 14 j');
  });

  test('« en cours » l’emporte sur « aujourd’hui »', () => {
    // L'ordre des tests compte : isToday est vrai dans les deux cas.
    assert.equal(label('2026-09-19', 0, '10h-12h30'), 'en cours');
  });
});

describe('upcomingSessions', () => {
  const trois = [
    slot({ date: '2026-09-19', horaire: '10h-12h30', days_left: 0, weekday: 5, jour: 'Samedi' }),
    slot({ date: '2026-09-25', horaire: '19h-20h30', days_left: 6, weekday: 4, jour: 'Vendredi' }),
    slot({ date: '2026-10-03', horaire: '10h-12h30', days_left: 14, weekday: 5, jour: 'Samedi' }),
  ];

  test('le critère d’acceptation : trois séances le 19/09 à 11h56', () => {
    const sessions = upcomingSessions(trois, NOW, 3);
    assert.deepEqual(
      sessions.map((s) => `${WEEKDAY_SHORT[s.weekday]} ${s.dayOfMonth} ${MONTH_SHORT[s.month]}`),
      ['sam. 19 sept.', 'ven. 25 sept.', 'sam. 3 oct.']
    );
    assert.equal(sessions[0].isToday, true);
  });

  test('une séance dont l’horaire est passé disparaît le jour même', () => {
    // La demande explicite : à 12 h 31, la séance de 10 h – 12 h 30 n'a plus
    // d'intérêt. La garder en tête de card jusqu'à minuit est le défaut que
    // le rafraîchissement à la minute existe pour corriger.
    const sessions = upcomingSessions(trois, new Date(2026, 8, 19, 12, 31), 3);
    assert.equal(sessions.length, 2);
    assert.equal(sessions[0].date, '2026-09-25');
  });

  test('une séance en cours reste affichée', () => {
    const sessions = upcomingSessions(trois, new Date(2026, 8, 19, 12, 29), 3);
    assert.equal(sessions[0].date, '2026-09-19');
    assert.equal(sessions[0].isNow, true);
  });

  test('sans horaire connu, la journée entière est conservée', () => {
    // On ne peut pas savoir si elle est passée : la faire disparaître à une
    // heure arbitraire serait pire que la garder.
    const sessions = upcomingSessions(
      [slot({ date: '2026-09-19', horaire: null, days_left: 0 })],
      new Date(2026, 8, 19, 23, 30),
      3
    );
    assert.equal(sessions.length, 1);
  });

  test('les séances passées sont écartées', () => {
    const sessions = upcomingSessions(
      [slot({ date: '2026-09-17', horaire: null, days_left: -2 }), ...trois],
      NOW,
      3
    );
    assert.equal(sessions.length, 3);
    assert.equal(sessions[0].date, '2026-09-19');
  });

  test('le tri est chronologique quelle que soit l’entrée', () => {
    const sessions = upcomingSessions([trois[2], trois[0], trois[1]], NOW, 3);
    assert.deepEqual(sessions.map((s) => s.date), ['2026-09-19', '2026-09-25', '2026-10-03']);
  });

  test('count tronque, et un count plus grand ne fabrique rien', () => {
    assert.equal(upcomingSessions(trois, NOW, 1).length, 1);
    assert.equal(upcomingSessions(trois, NOW, 4).length, 3);
    assert.equal(upcomingSessions(trois, NOW, 0).length, 0);
  });
});

describe('sessionAriaLabel', () => {
  test('énonce la séance en toutes lettres', () => {
    const session = toSession(
      slot({ date: '2026-09-19', horaire: '10h-12h30', weekday: 5 }),
      NOW
    )!;
    assert.equal(sessionAriaLabel(session), 'samedi 19 septembre, 10h – 12h30');
  });

  test('sans horaire, pas de virgule orpheline', () => {
    const session = toSession(slot({ date: '2026-09-19', horaire: null, weekday: 5 }), NOW)!;
    assert.equal(sessionAriaLabel(session), 'samedi 19 septembre');
  });
});

describe('tables françaises', () => {
  test('les abréviations sont celles de la spécification', () => {
    assert.deepEqual([...WEEKDAY_SHORT], ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']);
    assert.deepEqual(
      [...MONTH_SHORT],
      ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
    );
  });

  test('l’index des jours est celui de Python, pas celui de JavaScript', () => {
    // Date.getDay() compte à partir du dimanche : un décalage d'un rang ferait
    // afficher « ven. » sur une tuile du samedi.
    assert.equal(WEEKDAY_SHORT[0], 'lun.');
    assert.equal(WEEKDAY_SHORT[5], 'sam.');
  });
});
