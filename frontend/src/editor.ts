import { LitElement, html, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import {
  ALL_STATUSES,
  ALL_WEEKDAYS,
  WEEKDAY_LABELS,
  type EscaladeConfig,
  type HassLike,
} from './types.js';

const STATUS_LABELS: Record<string, string> = {
  open: 'Créneaux ouverts',
  closed: 'Créneaux fermés',
  unknown: 'Statut non reconnu',
};

const EDITOR_LABELS: Record<string, string> = {
  entity: 'Entité (sensor)',
  mode: "Mode d'affichage",
  title: 'Titre personnalisé',
  show_title: 'Afficher le titre (mode tuiles)',
  days: 'Jours affichés',
  statuses: 'Statuts affichés',
  max: 'Nombre maximal de créneaux (mode liste)',
  count: 'Nombre de tuiles (mode tuiles)',
  show_time: "Afficher l'horaire",
  show_countdown: 'Afficher le délai',
  show_status: 'Afficher le statut',
  background: 'Photo de fond (mode tuiles)',
  overlay: 'Opacité du voile',
  accent_open: 'Couleur des créneaux ouverts',
  accent_closed: 'Couleur des créneaux fermés',
  accent_intensity: 'Intensité de la teinte',
};

// Constante de module : si l'identité du tableau change à chaque rendu,
// ha-form se reconstruit entièrement et le champ en cours de saisie perd le
// focus à chaque frappe.
const EDITOR_SCHEMA = [
  {
    name: 'entity',
    required: true,
    selector: { entity: { domain: 'sensor', integration: 'escalade_veauche' } },
  },
  {
    name: 'mode',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'list', label: 'Liste (une ligne par créneau)' },
          { value: 'tiles', label: 'Tuiles calendrier (compact)' },
        ],
      },
    },
  },
  { name: 'title', selector: { text: {} } },
  {
    name: 'days',
    selector: {
      select: {
        multiple: true,
        mode: 'list',
        options: ALL_WEEKDAYS.map((day) => ({
          // Chaîne et non entier : ha-form renvoie ce qu'il reçoit, et un
          // sélecteur `select` travaille en chaînes. setConfig les recoerce.
          value: String(day),
          label: WEEKDAY_LABELS[day] ?? String(day),
        })),
      },
    },
  },
  {
    name: 'statuses',
    selector: {
      select: {
        multiple: true,
        options: ALL_STATUSES.map((status) => ({
          value: status,
          label: STATUS_LABELS[status] ?? status,
        })),
      },
    },
  },
  { name: 'max', selector: { number: { min: 1, max: 60, mode: 'box' } } },
  // Les trois interrupteurs restent visibles en mode liste : ha-form n'affiche
  // pas conditionnellement sans un schéma calculé, et recalculer le schéma à
  // chaque rendu fait perdre le focus du champ en cours de saisie — le tableau
  // doit rester une constante de module.
  { name: 'count', selector: { number: { min: 1, max: 4, mode: 'box' } } },
  { name: 'show_title', selector: { boolean: {} } },
  { name: 'show_time', selector: { boolean: {} } },
  { name: 'show_countdown', selector: { boolean: {} } },
  { name: 'show_status', selector: { boolean: {} } },
  { name: 'background', selector: { text: {} } },
  { name: 'overlay', selector: { number: { min: 0, max: 1, step: 0.05, mode: 'slider' } } },
  // color_rgb renvoie un triplet [r, g, b] : setConfig le convertit. Un
  // sélecteur de couleur fige la teinte au lieu de suivre le thème, c'est le
  // prix du choix à la souris — en YAML, « var(--success-color) » reste
  // accepté et préférable.
  { name: 'accent_open', selector: { color_rgb: {} } },
  { name: 'accent_closed', selector: { color_rgb: {} } },
  {
    name: 'accent_intensity',
    selector: { number: { min: 0, max: 1, step: 0.05, mode: 'slider' } },
  },
] as const;

const computeEditorLabel = (s: { name: string }): string => EDITOR_LABELS[s.name] ?? s.name;

interface ValueChangedEvent extends CustomEvent {
  detail: { value: EscaladeConfig };
}

export class EscaladeCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;

  @state() private _config: EscaladeConfig = { entity: '' };

  public setConfig(config: EscaladeConfig): void {
    this._config = config ?? { entity: '' };
  }

  protected override createRenderRoot(): HTMLElement {
    // Light DOM : indispensable pour que ha-form trouve les selectors HA.
    return this;
  }

  protected override render(): TemplateResult {
    if (!this.hass) return html``;

    // Les jours sont stockés en entiers dans la config et affichés en chaînes
    // par ha-form. Convertir à l'affichage plutôt que de changer le stockage :
    // l'entier est la clé d'échange avec Python, et une config YAML écrite à
    // la main s'écrit « days: [1, 3] », pas « days: ['1', '3'] ».
    const data = {
      ...this._config,
      days: this._config.days?.map(String),
    };

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${EDITOR_SCHEMA}
        .computeLabel=${computeEditorLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: ValueChangedEvent): void {
    const next = { ...ev.detail.value } as Record<string, unknown>;
    for (const key of Object.keys(next)) {
      // 'entity' n'est jamais supprimée : ha-form émet undefined quand on vide
      // le champ, et une config sans clé 'entity' cassait définitivement la
      // carte sur le dépôt d'origine (setConfig levait, HA la remplaçait par
      // sa carte d'erreur). setConfig tolère aussi, en second rempart : les
      // deux sont nécessaires.
      if (key === 'entity') {
        if (typeof next[key] !== 'string') next[key] = '';
        continue;
      }
      if (key === 'days' && Array.isArray(next[key])) {
        // Reconverti en entiers avant écriture : c'est la forme que lit
        // Python, et celle qu'on relira dans le YAML.
        next[key] = (next[key] as unknown[])
          .map(Number)
          .filter((value) => Number.isInteger(value));
      }
      const v = next[key];
      // `0` est légitime pour overlay — voile transparent — et `false` l'est
      // pour les trois interrupteurs. Un test de véracité les supprimerait,
      // et la carte reprendrait ses défauts : voile à 0,35 sur une photo que
      // l'utilisateur vient justement de vouloir nette.
      if (v === '' || v === undefined || v === null) delete next[key];
      if (Array.isArray(v) && v.length === 0) delete next[key];
    }
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: next },
        bubbles: true,
        composed: true,
      })
    );
  }
}

// Même garde idempotente que la carte : sur WebView Android, le script peut
// être ré-évalué au retour de veille.
if (!customElements.get('escalade-card-editor')) {
  customElements.define('escalade-card-editor', EscaladeCardEditor);
}
