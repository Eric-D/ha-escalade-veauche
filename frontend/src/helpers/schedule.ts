/** Construction des séances à partir d'un créneau, et libellés français.

Ces fonctions décident de ce qui s'affiche et de ce qui disparaît. Une erreur
n'y produit aucune trace : une séance qui reste à l'écran après son horaire,
un « dans 6 j » qui compte en tranches de 24 h et saute un jour au passage à
l'heure d'hiver, un mois abrégé faux. D'où leur isolement ici, et leurs tests.

**Pourquoi le mode tuiles recalcule ce que Python dérive déjà.**
Ailleurs dans ce dépôt, recalculer `days_left` en TypeScript est interdit : le
navigateur n'est pas forcément dans le fuseau de Home Assistant. Le mode
tuiles fait exception, et ce n'est pas un oubli.

L'intégration ne relève le calendrier qu'une fois par heure. Entre minuit et
le relevé suivant, **`days_left` est périmé d'un jour** : la séance de ce soir
s'annoncerait « demain » jusqu'à 1 h du matin. Le mode liste s'en accommode —
il affiche un délai approximatif sur une card qu'on lit en passant — mais les
tuiles doivent basculer à minuit sans recharger la page, et afficher « en
cours » à la minute près. Les deux exigences imposent l'horloge locale.

La contrepartie est assumée et vaut d'être connue : sur un appareil dont le
fuseau diffère de celui de Home Assistant, les tuiles comptent les jours dans
le fuseau de l'appareil. Pour une tablette murale à Veauche, c'est exactement
ce qu'on veut ; pour un téléphone en voyage, « demain » peut désigner le jour
de l'appareil et non celui du club.
*/
import type { Session, Slot, TimeRange } from '../types.js';

/** Abréviations de jour, indexées par `weekday()` Python : 0 = lundi.

    Tables explicites et non `toLocaleDateString` : sans `fr-FR` forcé, la
    locale du navigateur décide, et une tablette en anglais afficherait
    « SAT. ». `Date.getDay()` est de surcroît décalé d'un rang — il compte à
    partir du dimanche. */
export const WEEKDAY_SHORT = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'] as const;

export const WEEKDAY_LONG = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;

/** Abréviations de mois, indexées de 0 (janvier) à 11. */
export const MONTH_SHORT = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
] as const;

export const MONTH_LONG = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

// « 19h00-21h30 », « 10h-12h30 », « 19 h 00 – 20 h 30 ». Les minutes sont
// facultatives des deux côtés, le séparateur accepte les trois tirets.
const RANGE_PATTERN =
  /(\d{1,2})\s*h\s*(\d{2})?\s*[-–—]\s*(\d{1,2})\s*h\s*(\d{2})?/;

/** Minutes depuis minuit, ou null si l'horaire n'est pas lisible.

    null et non 0 : 0 signifierait minuit, donc une séance qu'on masquerait
    dès la première minute de la journée. */
export function parseTimeRange(horaire: string | null | undefined): TimeRange | null {
  if (typeof horaire !== 'string') return null;
  const match = RANGE_PATTERN.exec(horaire);
  if (!match) return null;

  const startH = Number(match[1]);
  const startM = Number(match[2] ?? '0');
  const endH = Number(match[3]);
  const endM = Number(match[4] ?? '0');
  // Une heure à 25 ou des minutes à 70 viennent d'une coquille du site : mieux
  // vaut ne pas afficher d'horaire que d'en afficher un faux, qui masquerait
  // la séance au mauvais moment.
  if (startH > 23 || endH > 23 || startM > 59 || endM > 59) return null;

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  // Une séance qui finit avant de commencer n'est pas exploitable. Pas de
  // rattrapage « elle passe minuit » : le club ferme à 21 h 30.
  if (end <= start) return null;
  return { start, end };
}

/** « 10h – 12h30 » : heures pleines sans minutes, tiret demi-cadratin. */
export function formatTimeRange(range: TimeRange | null): string | null {
  if (!range) return null;
  const one = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  };
  return `${one(range.start)} – ${one(range.end)}`;
}

/** Date civile locale d'un `YYYY-MM-DD`, à l'heure donnée.

    Construite champ par champ et non par `new Date(iso)` : la forme courte
    est interprétée en UTC par la spécification, donc « 2026-09-19 » devient
    le 18 à 22 h à Paris et la séance change de jour. */
function localDate(iso: string, minutes = 0): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Math.floor(minutes / 60),
    minutes % 60,
    0,
    0
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Différence en **jours civils**, jamais en tranches de 24 heures.

    Les deux dates sont ramenées à midi avant soustraction : sans ça, la nuit
    du changement d'heure fait 23 ou 25 heures et le décompte saute un jour.
*/
export function civilDaysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 12);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** « en cours », « aujourd'hui », « demain », « dans N j ». */
export function countdownLabel(session: Session): string {
  if (session.isNow) return 'en cours';
  if (session.daysUntil === null) return '';
  if (session.daysUntil === 0) return "aujourd'hui";
  if (session.daysUntil === 1) return 'demain';
  return `dans ${session.daysUntil} j`;
}

/** Séance exploitable par les tuiles, ou null si la date est illisible.

    `now` est injecté : sans ça, rien de tout ceci ne se teste autrement qu'en
    déplaçant l'horloge de la machine.
*/
export function toSession(slot: Slot, now: Date): Session | null {
  if (typeof slot.date !== 'string') return null;
  const day = localDate(slot.date);
  if (!day) return null;

  const range = parseTimeRange(slot.horaire);
  const start = range ? localDate(slot.date, range.start) : day;
  const end = range ? localDate(slot.date, range.end) : null;
  if (!start) return null;

  // Calculé localement, jamais repris de `days_left` : voir l'en-tête du
  // module. Une valeur relevée il y a cinquante minutes ne peut pas dire si
  // minuit est passé depuis.
  const daysUntil = civilDaysBetween(now, day);

  return {
    date: slot.date,
    weekday: slot.weekday,
    dayOfMonth: day.getDate(),
    month: day.getMonth(),
    start,
    end,
    range,
    status: slot.open === true ? 'open' : slot.open === false ? 'closed' : 'unknown',
    statut: slot.statut,
    daysUntil,
    isToday: daysUntil === 0,
    isNow: end !== null && start <= now && now < end,
  };
}

/** Séances à venir, triées, tronquées à `count`.

    Le filtre porte sur la **fin** de la séance, pas sur le jour : une séance
    de 10 h à 12 h 30 n'a plus d'intérêt à 12 h 31, et la laisser en tête de
    card jusqu'à minuit est exactement ce que la spécification interdit.

    Sans horaire connu, on ne peut pas savoir si elle est passée : on garde
    alors la journée entière, plutôt que de faire disparaître une séance dont
    on ignore l'heure.
*/
export function upcomingSessions(slots: Slot[], now: Date, count: number): Session[] {
  const sessions: Session[] = [];
  for (const slot of slots) {
    const session = toSession(slot, now);
    if (!session) continue;
    if (session.end !== null) {
      if (session.end <= now) continue;
    } else if (session.daysUntil !== null && session.daysUntil < 0) {
      continue;
    }
    sessions.push(session);
  }
  sessions.sort((a, b) => a.start.getTime() - b.start.getTime());
  return sessions.slice(0, Math.max(0, count));
}

/** Libellé accessible : « samedi 19 septembre, 10h – 12h30 ». */
export function sessionAriaLabel(session: Session): string {
  const weekday = WEEKDAY_LONG[session.weekday] ?? '';
  const month = MONTH_LONG[session.month] ?? '';
  const when = `${weekday} ${session.dayOfMonth} ${month}`.trim();
  const hours = formatTimeRange(session.range);
  return hours ? `${when}, ${hours}` : when;
}
