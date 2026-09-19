/** Couleurs d'accent : normalisation et choix par statut.

Deux formes arrivent ici et il faut les accepter toutes les deux. L'éditeur
graphique utilise le sélecteur `color_rgb` de Home Assistant, qui renvoie un
triplet `[r, g, b]`. Le YAML écrit à la main, lui, contient une chaîne CSS —
et c'est la forme qu'on veut encourager, parce que `var(--success-color)` suit
le thème alors qu'un triplet le fige.
*/
import type { SlotStatus } from '../types.js';

/** Couleurs par défaut, reprises des jetons du thème.

    Des `var()` et non des hexadécimaux : une carte qui fige `#4caf50` ne suit
    plus le thème de l'utilisateur, et c'est précisément ce que les jetons
    existent pour éviter. Les replis hexadécimaux vivent dans la feuille de
    styles, là où `color-mix` a besoin d'une valeur si la propriété est absente.
*/
export const DEFAULT_ACCENTS: Record<SlotStatus, string> = {
  open: 'var(--success-color)',
  closed: 'var(--error-color)',
  unknown: 'var(--primary-color)',
};

export interface AccentConfig {
  open?: string;
  closed?: string;
}

/** Couleur CSS exploitable, ou undefined si la valeur est inattendue.

    La garde compte : la valeur part dans une propriété personnalisée que
    `color-mix` consomme. Un point-virgule ou une accolade permettrait d'y
    refermer la déclaration et d'en écrire d'autres. Le navigateur n'exécute
    pas de script depuis du CSS, mais rien n'oblige à laisser une carte
    repeindre le reste du tableau de bord.
*/
export function normalizeColor(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;

  // Sélecteur color_rgb de Home Assistant : [r, g, b].
  if (Array.isArray(raw)) {
    if (raw.length !== 3) return undefined;
    const channels = raw.map(Number);
    if (channels.some((c) => !Number.isInteger(c) || c < 0 || c > 255)) return undefined;
    return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
  }

  if (typeof raw !== 'string') return undefined;
  const value = raw.trim();
  if (value === '' || value.length > 120 || /[;{}<>]/.test(value)) return undefined;
  return value;
}

/** Accent d'un statut : réglage dédié, sinon jeton du thème.

    Le statut `unknown` n'est pas configurable : il ne dit rien du club, et lui
    donner une couleur choisie inviterait à le lire comme une troisième
    catégorie de créneau. Il reste sur l'accent primaire du thème.
*/
export function accentFor(status: SlotStatus, config: AccentConfig): string {
  const dedicated =
    status === 'open' ? config.open : status === 'closed' ? config.closed : undefined;
  return dedicated ?? DEFAULT_ACCENTS[status];
}
