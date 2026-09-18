/** Une ligne de créneau. Fonction pure, cf. `chrome.ts`. */
import { html, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

import { getDelayChip, slotStatus, statusColors, statusLabel } from '../helpers/slot.js';
import type { Slot } from '../types.js';

export interface SlotRowOptions {
  slot: Slot;
}

export function renderSlotRow({ slot }: SlotRowOptions): TemplateResult {
  const status = slotStatus(slot);
  const colors = statusColors(status);
  const delay = getDelayChip(slot.days_left);

  return html`
    <div class="escalade-row escalade-row-${status}">
      <span
        class="escalade-dot"
        style=${styleMap({ background: colors.color })}
        aria-hidden="true"
      ></span>
      <div class="escalade-row-main">
        <div class="escalade-row-day">
          <span class="escalade-day">${slot.jour}</span>
          <span class="escalade-date">${slot.date_display}</span>
        </div>
        ${slot.horaire
          ? html`<div class="escalade-hours">${slot.horaire}</div>`
          : nothing}
      </div>
      <div class="escalade-row-right">
        <span
          class="escalade-status"
          style=${styleMap({ color: colors.color, background: colors.bg })}
          >${statusLabel(status)}</span
        >
        <span class="escalade-delay escalade-delay-${delay.type}">${delay.text}</span>
      </div>
    </div>
  `;
}
