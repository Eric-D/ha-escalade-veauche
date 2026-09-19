/** Tuiles « calendrier » du mode `tiles`. Fonctions pures, cf. `chrome.ts`. */
import { html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import { accentFor, type AccentConfig } from '../helpers/accent.js';
import {
  MONTH_SHORT,
  WEEKDAY_SHORT,
  countdownLabel,
  formatTimeRange,
} from '../helpers/schedule.js';
import type { Session } from '../types.js';

/** Libellés de statut.

    « Fermé » et non « Annulé » : c'est le mot que le club écrit sur sa page,
    et la carte doit pouvoir être relue à côté du site sans traduction mentale.
    Le rendu, lui, est bien celui d'une séance annulée — variante rouge et
    tuile en retrait. */
const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert',
  closed: 'Fermé',
};

export interface TileOptions {
  session: Session;
  showTime: boolean;
  showCountdown: boolean;
  showStatus: boolean;
  accents: AccentConfig;
}

export function renderTile({
  session,
  showTime,
  showCountdown,
  showStatus,
  accents,
}: TileOptions): TemplateResult {
  const hours = formatTimeRange(session.range);
  const countdown = countdownLabel(session);
  const statusLabel = STATUS_LABELS[session.status];
  // Un statut non reconnu n'affiche rien plutôt qu'un point gris muet : la
  // couleur seule ne dirait pas ce qu'elle signifie.
  const showsStatus = showStatus && statusLabel !== undefined;
  const showsCountdown = showCountdown && countdown !== '';

  // Posée sur la tuile et non sur la card : la couleur dépend du statut de
  // chaque séance. Les règles qui la consomment — fond de la tuile du jour,
  // pastille de statut — gardent leur repli statique dans la feuille de
  // styles, ce qu'une déclaration construite ici ne saurait pas faire.
  const accent = `--esc-accent:${accentFor(session.status, accents)}`;

  return html`
    <div
      class=${classMap({
        'esc-tile': true,
        today: session.isToday,
        closed: session.status === 'closed',
        // La teinte ne s'applique qu'à un statut connu ; la classe de statut
        // sert aux replis statiques, faute de pouvoir les dériver de l'accent.
        tinted: session.status !== 'unknown',
        [`status-${session.status}`]: true,
      })}
      style=${accent}
    >
      <span class="esc-weekday">${WEEKDAY_SHORT[session.weekday] ?? ''}</span>
      <span class="esc-daynum">${session.dayOfMonth}</span>
      <span class="esc-month">${MONTH_SHORT[session.month] ?? ''}</span>
      ${showTime && hours ? html`<span class="esc-time">${hours}</span>` : nothing}
      ${showsCountdown || showsStatus
        ? html`<div class="esc-bottom">
            <span class="esc-countdown">${showsCountdown ? countdown : ''}</span>
            ${showsStatus
              ? html`<span class="esc-status esc-status-${session.status}"
                  ><span class="esc-status-dot"></span>${statusLabel}</span
                >`
              : nothing}
          </div>`
        : nothing}
    </div>
  `;
}

export interface TilesOptions {
  sessions: Session[];
  columns: number;
  showTime: boolean;
  showCountdown: boolean;
  showStatus: boolean;
  accents: AccentConfig;
}

export function renderTiles({
  sessions,
  columns,
  showTime,
  showCountdown,
  showStatus,
  accents,
}: TilesOptions): TemplateResult {
  // `columns` vient de `count` et non du nombre de séances : avec deux séances
  // pour trois tuiles demandées, les colonnes restantes doivent rester vides,
  // sans tuile fantôme, pour que la card ne change pas de largeur de piste.
  return html`
    <div class="esc-tiles" style="--esc-columns:${columns}">
      ${sessions.map((session) =>
        renderTile({ session, showTime, showCountdown, showStatus, accents })
      )}
    </div>
  `;
}

/** Titre optionnel, au-dessus de la grille. */
export function renderTilesTitle(title: string): TemplateResult {
  return html`<div class="esc-tiles-title">${title}</div>`;
}

/** Ligne unique quand il n'y a rien à montrer. Même fond, hauteur minimale. */
export function renderTilesMessage(text: string): TemplateResult {
  return html`<div class="esc-tiles-empty">${text}</div>`;
}
