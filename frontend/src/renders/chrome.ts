/** En-tête, loader et bandeau de péremption.

Fonctions pures : elles reçoivent tout ce dont elles ont besoin, y compris les
gestionnaires d'événements. Les paramètres multiples passent par un objet nommé
— deux chaînes adjacentes dans une signature positionnelle s'inversent sans que
rien ne le signale, ni le typage ni le linter, et sans test de rendu personne
ne le verrait.
*/
import { html, nothing, type TemplateResult } from 'lit';

import type { FreshnessAttributes } from '../types.js';

export interface LoaderOptions {
  title: string;
  message?: string;
}

export function renderLoader({
  title,
  message = 'Chargement…',
}: LoaderOptions): TemplateResult {
  return html`
    <ha-card>
      <div class="escalade-header">
        <span class="escalade-title">${title}</span>
      </div>
      <div class="escalade-loader-box">
        <div class="escalade-loader"></div>
        <div class="escalade-loader-text">${message}</div>
      </div>
    </ha-card>
  `;
}

// Le club met son calendrier à jour à la main, souvent la veille : une demi-
// journée sans relevé n'est pas une anomalie. Au-delà, l'information affichée
// peut avoir changé sans qu'on le sache, et c'est ce qu'il faut dire.
const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

export function renderStaleNotice(
  attrs: FreshnessAttributes
): TemplateResult | typeof nothing {
  // fetch_ok=false signifie que le coordinator est retombé sur son cache : les
  // entités restent disponibles et les données paraissent fraîches alors que
  // la liste date du dernier relevé réussi. Les délais, eux, sont recalculés à
  // chaque cycle côté intégration — c'est la liste qui est périmée, pas les
  // décomptes.
  if (attrs.fetch_ok !== false) return nothing;

  const lastSuccess = attrs.last_success ? new Date(attrs.last_success) : null;
  const stamp = lastSuccess?.getTime();
  // Seuil en durée et non « même jour civil » : cette seconde forme alerte sur
  // dix minutes d'écart à 00 h 05 et se tait sur quinze heures à 23 h 00.
  if (stamp !== undefined && !Number.isNaN(stamp)) {
    if (Date.now() - stamp < STALE_AFTER_MS) return nothing;
  }

  const since =
    stamp === undefined || Number.isNaN(stamp)
      ? 'date inconnue'
      : lastSuccess!.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  return html`
    <div class="escalade-stale" role="status">
      <span>⚠</span>
      <span>Calendrier du club injoignable — créneaux relevés le ${since}</span>
    </div>
  `;
}

export interface HeaderOptions {
  title: string;
  badgeText: string;
  highlight: boolean;
  onRefresh?: () => void;
}

export function renderHeader({
  title,
  badgeText,
  highlight,
  onRefresh,
}: HeaderOptions): TemplateResult {
  return html`
    <div class="escalade-header">
      <span class="escalade-title">${title}</span>
      <span class="escalade-header-right">
        <span class="escalade-count ${highlight ? 'highlight' : ''}">${badgeText}</span>
        ${onRefresh
          ? html`<button
              class="escalade-refresh"
              title="Relire le calendrier du club"
              @click=${onRefresh}
            >
              ⟳
            </button>`
          : nothing}
      </span>
    </div>
  `;
}
