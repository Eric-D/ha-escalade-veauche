import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import {
  ALL_MODES,
  ALL_STATUSES,
  ALL_WEEKDAYS,
  MODE_ALIASES,
  STATUS_ALIASES,
  type CalendarAttributes,
  type CardMode,
  type EscaladeConfig,
  type HassEntityState,
  type HassLike,
  type Session,
  type Slot,
  type SlotStatus,
} from './types.js';
import { normalizeColor } from './helpers/accent.js';
import { slotStatus } from './helpers/slot.js';
import { RetryScheduler } from './helpers/retry.js';
import { sessionAriaLabel, upcomingSessions } from './helpers/schedule.js';
import { renderHeader, renderLoader, renderStaleNotice } from './renders/chrome.js';
import { renderSlotRow } from './renders/slot-row.js';
import { renderTiles, renderTilesMessage } from './renders/tiles.js';
import { logBanner, ecLog } from './version.js';
import { cardStyles } from './styles/card.js';
import { tilesStyles } from './styles/tiles.js';

import './editor.js';

interface GridOptions {
  columns: number;
  min_columns: number;
  // 'auto' en mode tuiles : la hauteur dépend des groupes de détails activés,
  // et un nombre de rangées figé couperait la ligne basse ou laisserait un
  // bandeau vide sous les tuiles.
  rows: number | 'auto';
  min_rows: number;
}

/** Cadence de rafraîchissement du mode tuiles.

    La minute est la granularité de « en cours » et du masquage d'une séance
    dont l'horaire vient de passer. C'est aussi ce qui fait basculer la card au
    passage de minuit sans attendre le prochain relevé de l'intégration, qui
    n'a lieu qu'une fois par heure. */
const TICK_MS = 60000;

export class EscaladeCard extends LitElement {
  static override styles = [cardStyles, tilesStyles];

  @property({ attribute: false }) public set hass(value: HassLike | undefined) {
    this._hass = value;
    // Lit enveloppe ce setter et appelle requestUpdate() lui-même après coup :
    // inutile (et trompeur) de le rappeler ici. Le filtrage des re-rendus
    // inutiles se fait dans shouldUpdate(), pas ici — sinon on croit optimiser
    // alors que la carte re-render à chaque événement de l'instance HA.
    //
    // Aucun early-return : une garde d'égalité ici n'est pas seulement
    // inutile, elle est nuisible — elle sauterait _syncEntityState() et
    // laisserait l'état vide au premier rendu. requestUpdate() filtre déjà
    // par notEqual sur l'ancienne valeur.
    this._syncEntityState();
  }
  public get hass(): HassLike | undefined {
    return this._hass;
  }

  @state() private _config?: EscaladeConfig;

  /** Sert uniquement à tracer le cycle de vie : le chemin nominal étant
   *  silencieux, « aucun log » ne permettait pas de distinguer « HA n'a jamais
   *  utilisé notre élément » de « tout s'est bien passé ». C'est ce
   *  raisonnement faux qui a coûté le plus de temps sur le dépôt d'origine. */
  private static _instances = 0;
  private readonly _id = ++EscaladeCard._instances;

  private _hass?: HassLike;
  private _entityState?: HassEntityState;
  private _retry = new RetryScheduler('card', () => this.requestUpdate());
  private _hasRendered = false;
  private _renderedEntityState?: HassEntityState;
  private _lastTemplate?: TemplateResult;
  private _firstUpdateLogged = false;
  private _tick: ReturnType<typeof setInterval> | null = null;

  public setConfig(config: EscaladeConfig): void {
    // Seule une configuration non-objet est bloquante. Tout le reste est
    // tolérant, pour ne jamais casser un tableau de bord sur un champ
    // optionnel mal renseigné ; les anomalies partent dans la console.
    if (!config || typeof config !== 'object') {
      ecLog('error', 'card', 'setConfig rejeté, config non-objet : %o', config);
      throw new Error('Configuration manquante ou invalide');
    }

    // 'entity' absente, null ou vide = état transitoire légitime : stub du
    // sélecteur de cartes, éditeur ouvert avant sélection, « entity: » sans
    // valeur en YAML qui parse en null. La convention Home Assistant veut
    // qu'on lève ; ici ça rendait la carte irrécupérable depuis l'interface,
    // remplacée définitivement par « Erreur de configuration » et sans la
    // moindre trace console. On tolère, on loggue, et _render() affiche un
    // loader explicite. L'éditeur recoerce de son côté (editor.ts,
    // _valueChanged) : les deux remparts sont nécessaires, retirer l'un en
    // croyant l'autre suffisant restaure la panne.
    let entity = '';
    if (typeof config.entity === 'string') {
      entity = config.entity;
    } else if (config.entity !== undefined && config.entity !== null) {
      ecLog(
        'error',
        'card',
        "'entity' doit être une chaîne, reçu %o — carte en attente de configuration",
        config.entity
      );
    }

    const statuses = this._normalizeStatuses(config.statuses);
    const days = this._normalizeDays(config.days);
    const mode = this._normalizeMode(config.mode);
    const count = this._normalizeCount(config.count);
    const overlay = this._normalizeOverlay(config.overlay);
    const background = this._normalizeBackground(config.background);
    const accentOpen = this._normalizeAccent('accent_open', config.accent_open);
    const accentClosed = this._normalizeAccent('accent_closed', config.accent_closed);

    let max: number | undefined;
    if (config.max !== undefined) {
      const value = Number(config.max);
      if (!Number.isInteger(value) || value < 1) {
        ecLog('warn', 'card', "'max' doit être un entier positif, ignoré (reçu : %o)", config.max);
      } else {
        max = value;
      }
    }

    ecLog(
      'info',
      'card',
      '#%d setConfig accepté (entity=%s, mode=%s, jours=%s, statuts=%s) à t=%dms',
      this._id,
      entity || '(vide)',
      mode,
      days ? days.join(',') : 'tous',
      statuses ? statuses.join(',') : 'tous',
      Math.round(performance.now())
    );

    const previous = this._config;
    this._config = {
      ...config,
      entity,
      days,
      statuses,
      max,
      mode,
      count,
      overlay,
      background,
      accent_open: accentOpen,
      accent_closed: accentClosed,
      // Les trois détails sont volontairement à false par défaut : c'est la
      // card la plus basse, l'utilisateur active ensuite ce qu'il veut.
      show_time: config.show_time === true,
      show_countdown: config.show_countdown === true,
      show_status: config.show_status === true,
    };

    // Changer d'entité invalide tout ce qui a été rendu jusqu'ici : sans ce
    // reset, _render() renverrait _lastTemplate — les créneaux de l'ancienne
    // entité — dès que la nouvelle est indisponible, indéfiniment.
    if (previous?.entity !== this._config.entity) {
      this._hasRendered = false;
      this._lastTemplate = undefined;
      this._renderedEntityState = undefined;
      this._retry.reset();
    }
    // L'état est résolu dans le setter hass ; sans ce rappel, une nouvelle
    // entité n'est prise en compte qu'au prochain push de hass.
    this._syncEntityState();
  }

  private _normalizeStatuses(raw: unknown): SlotStatus[] | undefined {
    if (raw === undefined) return undefined;
    if (!Array.isArray(raw)) {
      ecLog('warn', 'card', "'statuses' doit être une liste, ignoré (reçu : %o)", raw);
      return undefined;
    }
    const valid: SlotStatus[] = [];
    const invalid: unknown[] = [];
    for (const item of raw) {
      const aliased = STATUS_ALIASES[String(item)] ?? item;
      if (ALL_STATUSES.includes(aliased as SlotStatus)) {
        if (!valid.includes(aliased as SlotStatus)) valid.push(aliased as SlotStatus);
      } else {
        invalid.push(item);
      }
    }
    if (invalid.length) {
      ecLog(
        'warn',
        'card',
        'Statuts inconnus ignorés : %s. Valides : %s',
        invalid.join(', '),
        ALL_STATUSES.join(', ')
      );
    }
    // Un filtre vide masquerait tous les créneaux, ce qui est indiscernable de
    // « le club n'a rien annoncé ». Vaut aussi pour « statuses: [] » écrit à la
    // main, pas seulement pour une liste devenue vide après validation.
    if (valid.length === 0) {
      ecLog('warn', 'card', 'Filtre de statuts vide, filtre ignoré');
      return undefined;
    }
    return valid;
  }

  private _normalizeDays(raw: unknown): number[] | undefined {
    if (raw === undefined) return undefined;
    if (!Array.isArray(raw)) {
      ecLog('warn', 'card', "'days' doit être une liste, ignoré (reçu : %o)", raw);
      return undefined;
    }
    const valid: number[] = [];
    const invalid: unknown[] = [];
    for (const item of raw) {
      // Number() et non parseInt : l'éditeur ha-form renvoie des chaînes, et
      // parseInt('3jours') vaudrait 3 au lieu d'être rejeté.
      const value = Number(item);
      if (Number.isInteger(value) && ALL_WEEKDAYS.includes(value)) {
        if (!valid.includes(value)) valid.push(value);
      } else {
        invalid.push(item);
      }
    }
    if (invalid.length) {
      ecLog(
        'warn',
        'card',
        'Jours inconnus ignorés : %s. Attendu : 0 (lundi) à 6 (dimanche)',
        invalid.join(', ')
      );
    }
    if (valid.length === 0) {
      ecLog('warn', 'card', 'Filtre de jours vide, filtre ignoré');
      return undefined;
    }
    valid.sort((a, b) => a - b);
    return valid;
  }

  private _normalizeMode(raw: unknown): CardMode {
    if (raw === undefined) return 'list';
    const aliased = MODE_ALIASES[String(raw)] ?? raw;
    if (ALL_MODES.includes(aliased as CardMode)) return aliased as CardMode;
    ecLog(
      'warn',
      'card',
      "Mode '%s' inconnu, repli sur 'list'. Modes valides : %s",
      raw,
      ALL_MODES.join(', ')
    );
    return 'list';
  }

  private _normalizeCount(raw: unknown): number {
    if (raw === undefined) return 3;
    const value = Number(raw);
    // Plafonné à 4 : au-delà, les tuiles passent sous la largeur où le numéro
    // du jour et l'horaire restent lisibles sur une card de tableau de bord.
    if (!Number.isInteger(value) || value < 1 || value > 4) {
      ecLog('warn', 'card', "'count' doit être un entier de 1 à 4, repli sur 3 (reçu : %o)", raw);
      return 3;
    }
    return value;
  }

  private _normalizeOverlay(raw: unknown): number {
    if (raw === undefined) return 0.35;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      ecLog('warn', 'card', "'overlay' doit être entre 0 et 1, repli sur 0.35 (reçu : %o)", raw);
      return 0.35;
    }
    return value;
  }

  /** Chemin de la photo de fond, ou undefined.

      Filtré par liste blanche, et c'est la garde qui compte : la valeur part
      dans `background-image: url(...)`. Une chaîne contenant une parenthèse,
      une apostrophe ou un point-virgule permettrait d'y refermer la fonction
      et d'écrire d'autres déclarations. Le navigateur n'exécute pas de script
      depuis du CSS, mais rien n'oblige à laisser une carte repeindre le reste
      du tableau de bord. */
  private _normalizeBackground(raw: unknown): string | undefined {
    if (raw === undefined || raw === 'none' || raw === '') return undefined;
    if (typeof raw !== 'string' || !/^[\w\-./:%?&=+@,~#]+$/.test(raw)) {
      ecLog('warn', 'card', "'background' ignoré : chemin inattendu (%o)", raw);
      return undefined;
    }
    return raw;
  }

  /** Couleur d'accent, chaîne CSS ou triplet du sélecteur de couleur. */
  private _normalizeAccent(name: string, raw: unknown): string | undefined {
    if (raw === undefined) return undefined;
    const color = normalizeColor(raw);
    if (color === undefined) {
      ecLog('warn', 'card', "'%s' ignoré : valeur inattendue (%o)", name, raw);
    }
    return color;
  }

  /** Résout l'état suivi à partir de la config et du hass courants. */
  private _syncEntityState(): void {
    const states = this._hass?.states;
    if (!states || !this._config?.entity) {
      // Sans ça, vider l'entité laisse l'état de la précédente en place.
      this._entityState = undefined;
      return;
    }
    this._entityState = states[this._config.entity];
  }

  public static getStubConfig(
    hass?: HassLike,
    entities?: string[],
    entitiesFallback?: string[]
  ): EscaladeConfig {
    // HA instancie un aperçu avec ce stub dès l'ouverture du sélecteur de
    // cartes. On pré-remplit avec un vrai capteur de l'intégration, reconnu à
    // son attribut 'creneaux'.
    const states = hass?.states ?? {};
    const pool = [
      ...(entities ?? []),
      ...(entitiesFallback ?? []),
      ...Object.keys(states),
    ].filter((id) => id.startsWith('sensor.'));
    const entity =
      pool.find((id) => (states[id]?.attributes as CalendarAttributes | undefined)?.creneaux) ??
      pool.find((id) => id.includes('escalade')) ??
      '';
    return { entity };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement('escalade-card-editor');
  }

  private get _detailsShown(): boolean {
    const config = this._config;
    return !!(config?.show_time || config?.show_countdown || config?.show_status);
  }

  public getCardSize(): number {
    if (this._config?.mode !== 'tiles') return 4;
    return this._detailsShown ? 3 : 2;
  }

  public getGridOptions(): GridOptions {
    if (this._config?.mode !== 'tiles') {
      return { columns: 12, min_columns: 6, rows: 4, min_rows: 2 };
    }
    return { columns: 12, min_columns: 6, rows: 'auto', min_rows: 1 };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    // Hors d'ici, le compteur n'est remis à zéro que par un rendu de données
    // réussi : un élément re-connecté — changement de vue, déplacement entre
    // sections — repartirait donc avec un quota déjà épuisé.
    this._retry.reset();

    // Pas de performUpdate() synchrone ici. Il avait été ajouté sur le dépôt
    // d'origine contre une cause inventée — « HA interprète un rendu vide
    // comme une erreur de configuration », mécanisme qui n'existe pas — et il
    // faisait rendre la carte de façon ré-entrante dans le commit Lit de Home
    // Assistant. Son retrait a rendu les changements de page nettement plus
    // rapides.

    // loadCardHelpers() est asynchrone : sur un chargement à froid, ce premier
    // rendu peut sortir un <ha-card> pas encore upgradé, donc non stylé. On
    // force un re-rendu dès que HA a défini l'élément.
    if (!customElements.get('ha-card')) {
      void customElements.whenDefined('ha-card').then(() => {
        ecLog('info', 'card', 'ha-card défini après le premier rendu, re-rendu');
        this.requestUpdate();
      });
    }

    // Posé ici et non dans setConfig : le mode peut changer sans que l'élément
    // soit reconnecté, et un timer par changement de configuration finirait par
    // en laisser plusieurs. La garde de mode est dans le tick, où elle ne coûte
    // rien.
    this._tick ??= setInterval(() => {
      if (this._config?.mode === 'tiles') this.requestUpdate();
    }, TICK_MS);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Aucun timer lié à un élément ne doit survivre à son détachement : une
    // vue changée cent fois laisserait cent intervalles à réveiller la carte
    // chaque minute.
    this._retry.cancel();
    if (this._tick !== null) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  protected override updated(): void {
    if (!this._firstUpdateLogged) {
      this._firstUpdateLogged = true;
      ecLog(
        'info',
        'card',
        '#%d premier rendu effectué à t=%dms (données=%s)',
        this._id,
        Math.round(performance.now()),
        this._hasRendered ? 'oui' : 'non, loader'
      );
    }
    this._renderedEntityState = this._entityState;
    if (this._hasRendered) {
      // Contrat public pour les plugins tiers — card-mod notamment — sans
      // aucun consommateur dans ce dépôt : personne ne verra sa disparition.
      this.dispatchEvent(
        new CustomEvent('escalade-card-update', { bubbles: true, composed: true })
      );
    }
  }

  protected override shouldUpdate(changedProperties: PropertyValues): boolean {
    // La config doit toujours passer — aperçu live de l'éditeur — car elle peut
    // arriver dans le même lot qu'un 'hass' dont les états n'ont pas bougé.
    if (changedProperties.has('_config')) return true;
    // Tant que rien n'a été rendu pour de bon, on ne bloque jamais.
    if (!this._hasRendered) return true;
    // HA réassigne 'hass' à chaque événement de l'instance, pas seulement pour
    // notre entité. Un requestUpdate() sans nom — retry, ha-card défini —
    // passe toujours.
    if (changedProperties.has('hass')) {
      return this._entityState !== this._renderedEntityState;
    }
    return true;
  }

  protected override render(): TemplateResult {
    // Wrapper anti-throw : si _render() lève (donnée HA inattendue, helper qui
    // crashe), l'update() de Lit lève, le shadow root reste vide et HA
    // substitue « Erreur de configuration ». On garantit un <ha-card> visible
    // quoi qu'il arrive — pas parce que HA inspecterait le shadow root, il ne
    // le fait pas, mais parce qu'un rendu vide ne donne à l'utilisateur
    // aucune information.
    try {
      return this._render();
    } catch (e) {
      ecLog('error', 'card', 'render() a levé, repli sur le loader : %o', e);
      // Sans ça, on reste sur l'erreur jusqu'au prochain hass utile.
      this._retry.schedule();
      return renderLoader({ title: 'Escalade Veauche', message: 'Erreur — voir console' });
    }
  }

  /** Message d'attente ou d'indisponibilité, dans l'habillage du mode courant.

      Le mode tuiles n'a ni en-tête ni compteur : y afficher le loader de la
      liste ferait sauter la card de 60 à 270 px à chaque coupure, ce qui
      déplace toutes les cards voisines d'un tableau de bord en maçonnerie. */
  private _message(title: string, text: string): TemplateResult {
    if (this._config?.mode !== 'tiles') {
      return renderLoader({ title, message: text });
    }
    return this._tilesShell(renderTilesMessage(text), null);
  }

  private _render(): TemplateResult {
    const title = this._config?.title ?? 'Créneaux escalade';

    if (!this._config) {
      return this._message(title, 'En attente de configuration…');
    }
    if (!this._hass) {
      return this._message(title, 'Connexion à Home Assistant…');
    }

    const entityId = this._config.entity;
    if (!entityId) {
      return this._message(title, 'Sélectionnez une entité');
    }

    const states = this._hass.states;
    if (!states) {
      ecLog('warn', 'card', 'hass.states absent, rendu du loader');
      this._retry.schedule();
      // Même règle que la branche « entité indisponible » : au-delà du quota
      // de retries, afficher indéfiniment le dernier rendu ferait passer des
      // créneaux périmés pour à jour.
      if (!this._retry.exhausted) {
        return this._lastTemplate ?? this._message(title, 'En attente de Home Assistant…');
      }
      return this._message(title, 'Données Home Assistant indisponibles');
    }

    const state = states[entityId];
    if (!state || state.state === 'unavailable' || state.state === 'unknown') {
      const reason = !state ? 'entité introuvable' : `state=${state.state}`;
      ecLog(
        'warn',
        'card',
        '%s — %s %s',
        entityId,
        reason,
        this._hasRendered ? '(dernier rendu conservé)' : '(loader)'
      );
      this._retry.schedule();
      if (this._hasRendered && !this._retry.exhausted) {
        // Indisponibilité brève : garder le dernier rendu évite un
        // clignotement à chaque rechargement de l'intégration.
        return this._lastTemplate ?? this._message(title, 'Chargement…');
      }
      if (this._hasRendered) {
        // Quota épuisé — environ 100 s d'indisponibilité continue. Continuer
        // d'afficher le dernier rendu ferait passer des créneaux périmés pour
        // à jour, sans le moindre indice : c'est précisément ce que le bandeau
        // de péremption évite sur le repli en cache, mais ce chemin-ci ne
        // l'atteint jamais puisque l'entité est indisponible.
        //
        // Texte neutre : la carte ne connaît pas la cause. Spéculer enverrait
        // chercher au mauvais endroit, par exemple après un simple redémarrage
        // un peu lent.
        return this._message(title, this._config?.mode === 'tiles'
          ? 'Créneaux indisponibles'
          : `${entityId} indisponible`);
      }
      // Une fois le quota épuisé, plus rien ne relancera la carte de lui-même :
      // un spinner perpétuel ferait croire à un chargement en cours.
      this._lastTemplate = this._message(
        title,
        this._retry.exhausted
          ? this._config?.mode === 'tiles'
            ? 'Créneaux indisponibles'
            : `Données indisponibles pour ${entityId}`
          : 'En attente des données…'
      );
      return this._lastTemplate;
    }

    // Une entité qui ne porte pas 'creneaux' n'est pas une entité de cette
    // intégration. Sans ce garde-fou, la carte affiche « Aucun créneau annoncé »
    // avec un badge à 0, ce qui ressemble à un état nominal — et à un club
    // fermé.
    const attributes = state.attributes ?? {};
    if (!('creneaux' in attributes)) {
      ecLog(
        'error',
        'card',
        "%s ne porte pas « creneaux » : ce n'est pas un capteur de cette intégration",
        entityId
      );
      return this._message(title, `${entityId} n'est pas un capteur Escalade`);
    }

    this._retry.reset();
    const tpl =
      this._config.mode === 'tiles'
        ? this._renderTilesMode(state)
        : this._renderCalendar(state, title);
    this._lastTemplate = tpl;
    this._hasRendered = true;
    return tpl;
  }

  /** Filtres de la carte, dans l'ordre : jour, puis statut, puis limite. */
  private _visibleSlots(slots: Slot[]): Slot[] {
    const days = this._config?.days;
    const statuses = this._config?.statuses;
    let visible = slots;
    if (days) {
      // weekday vient de Python (0 = lundi) : ne jamais le recalculer depuis
      // `date` en TypeScript, Date.getDay() compte à partir du dimanche.
      visible = visible.filter((slot) => days.includes(slot.weekday));
    }
    if (statuses) {
      visible = visible.filter((slot) => statuses.includes(slotStatus(slot)));
    }
    const max = this._config?.max;
    return max !== undefined ? visible.slice(0, max) : visible;
  }

  private _renderCalendar(state: HassEntityState, title: string): TemplateResult {
    const attrs = (state.attributes ?? {}) as CalendarAttributes;
    const slots = Array.isArray(attrs.creneaux) ? attrs.creneaux : [];
    const visible = this._visibleSlots(slots);

    const hasFilter = !!this._config?.days || !!this._config?.statuses;
    const badgeText = `${visible.length}`;

    return html`
      <ha-card>
        ${renderHeader({
          title,
          badgeText,
          highlight: hasFilter && visible.length > 0,
          onRefresh: this._refresh,
        })}
        ${renderStaleNotice(attrs)}
        ${visible.length === 0
          ? html`<div class="escalade-empty">
              ${slots.length === 0
                ? 'Aucun créneau annoncé par le club'
                : 'Aucun créneau ne correspond au filtre de cette carte'}
            </div>`
          : visible.map((slot) => renderSlotRow({ slot }))}
      </ha-card>
    `;
  }

  /** Enveloppe commune du mode tuiles : photo, voile, accent, action au tap.

      `aria-label` n'est posé que si la card est réellement cliquable : un
      libellé sur un élément inerte s'annonce quand même au lecteur d'écran, en
      promettant une action qui n'existe pas. */
  private _tilesShell(
    body: TemplateResult,
    firstSession: Session | null
  ): TemplateResult {
    const config = this._config;
    const background = config?.background;
    const action = config?.tap_action?.action ?? 'more-info';
    const clickable = action !== 'none';

    // Une seule propriété par valeur dynamique, toutes déclarées dans la
    // feuille de styles : c'est ce qui permet d'y garder un repli statique
    // pour `color-mix`, que styleMap ne saurait pas écrire.
    const style = [
      background ? `background-image:url("${background}")` : '',
      config?.overlay !== undefined ? `--esc-overlay:${config.overlay}` : '',

    ]
      .filter(Boolean)
      .join(';');

    const label = firstSession
      ? `Escalade : prochaine séance ${sessionAriaLabel(firstSession)}`
      : 'Escalade : créneaux';

    return html`
      <ha-card
        class="esc-tiles-card ${clickable ? 'clickable' : ''}"
        style=${style}
        role=${clickable ? 'button' : 'presentation'}
        tabindex=${clickable ? '0' : '-1'}
        aria-label=${clickable ? label : ''}
        @click=${clickable ? this._handleTap : undefined}
        @keydown=${clickable ? this._handleKeydown : undefined}
      >
        ${background ? html`<div class="esc-veil"></div>` : nothing}
        ${body}
      </ha-card>
    `;
  }

  private _renderTilesMode(state: HassEntityState): TemplateResult {
    const attrs = (state.attributes ?? {}) as CalendarAttributes;
    const slots = Array.isArray(attrs.creneaux) ? attrs.creneaux : [];
    const count = this._config?.count ?? 3;

    // `new Date()` à chaque rendu, jamais mémorisé : c'est le tick qui fait
    // avancer l'heure, et une valeur capturée à la construction figerait
    // « en cours » pour toute la vie de la card.
    const sessions = upcomingSessions(this._visibleSlots(slots), new Date(), count);

    const body =
      sessions.length === 0
        ? renderTilesMessage('Aucune séance à venir')
        : renderTiles({
            sessions,
            columns: count,
            showTime: this._config?.show_time === true,
            showCountdown: this._config?.show_countdown === true,
            showStatus: this._config?.show_status === true,
            accents: {
              open: this._config?.accent_open as string | undefined,
              closed: this._config?.accent_closed as string | undefined,
            },
          });

    return this._tilesShell(
      sessions.length === 0 ? body : html`<div class="esc-tiles-body">${body}</div>`,
      sessions[0] ?? null
    );
  }

  private _handleKeydown = (e: KeyboardEvent): void => {
    // Entrée et Espace, comme un vrai bouton : sans ça, `role="button"` promet
    // au lecteur d'écran une interaction qu'aucun clavier ne peut déclencher.
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this._handleTap();
  };

  private _handleTap = (): void => {
    const config = this._config;
    const action = config?.tap_action?.action ?? 'more-info';
    if (action === 'none' || !config) return;

    if (action === 'url') {
      const url = config.tap_action?.url_path;
      // noopener : sans lui, la page ouverte garde une référence sur celle de
      // Home Assistant par window.opener.
      if (url) window.open(url, '_blank', 'noopener');
      return;
    }
    if (action === 'navigate') {
      const path = config.tap_action?.navigation_path;
      if (!path) return;
      history.pushState(null, '', path);
      // L'événement est ce qui fait réagir le routeur de Home Assistant :
      // pushState seul change l'URL sans changer la vue.
      window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
      return;
    }
    if (!config.entity) return;
    this.dispatchEvent(
      new CustomEvent('hass-more-info', {
        detail: { entityId: config.entity },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _refresh = (): void => {
    if (!this._hass) return;
    // Home Assistant affiche déjà sa notification d'erreur ; sans catch,
    // chaque échec laisse une promesse rejetée non gérée dans la console.
    void this._hass.callService('escalade_veauche', 'refresh', {}).catch((e: unknown) => {
      ecLog('warn', 'card', 'le rafraîchissement a échoué : %o', e);
    });
  };
}

declare global {
  interface Window {
    customCards?: Array<{ type: string; name: string; description?: string }>;
    loadCardHelpers?: () => Promise<unknown>;
  }
}

logBanner();

// Force HA à charger ses définitions d'éléments personnalisés (ha-card,
// ha-form…). Sans cet appel, sur un chargement à froid, notre carte est
// enregistrée avant que HA ait défini ha-card, ce qui produit un rendu cassé.
void window.loadCardHelpers?.().catch((e: unknown) => {
  ecLog('warn', 'card', 'loadCardHelpers() a échoué : %o', e);
});

const CARD_TAG = 'escalade-card';
const MAX_REREGISTRATIONS = 5;
let reregistrations = 0;

/**
 * Garantit que le tag est résolvable par le registre d'éléments personnalisés
 * *actuellement installé*.
 *
 * Home Assistant charge @webcomponents/scoped-custom-element-registry, qui
 * REMPLACE window.customElements par sa propre implémentation, avec sa propre
 * table. Si ce module s'enregistre avant l'installation du polyfill, la
 * définition atterrit dans le registre natif : le polyfill prend ensuite la
 * main et ne nous connaît pas. HA appelle customElements.get() → rien, et
 * affiche « Custom element doesn't exist ». Son rattrapage par whenDefined()
 * est mort-né pour la même raison.
 *
 * Symptôme observé, impossible autrement : customElements.get(tag) renvoie
 * undefined alors que document.createElement(tag) produit un élément upgradé
 * avec son setConfig — document.createElement consulte, lui, le registre natif.
 *
 * D'où l'intermittence, et son inversion apparente : c'est le chargement le
 * plus RAPIDE qui échoue, le polyfill s'installant vers 110–130 ms.
 */
function ensureRegisteredInCurrentRegistry(): boolean {
  if (customElements.get(CARD_TAG)) return false;
  if (reregistrations >= MAX_REREGISTRATIONS) return false;
  reregistrations++;
  try {
    // Constructeur neuf obligatoire : une même classe ne peut pas être
    // enregistrée deux fois, y compris dans un registre différent.
    customElements.define(CARD_TAG, class extends EscaladeCard {});
    ecLog(
      'warn',
      'card',
      "ré-enregistré à t=%dms : le registre d'éléments personnalisés avait été remplacé depuis le premier enregistrement",
      Math.round(performance.now())
    );
    return true;
  } catch (e) {
    ecLog('error', 'card', 'ré-enregistrement impossible : %o', e);
    return false;
  }
}

// Garde idempotente : sur WebView Android, le script peut être ré-évalué au
// retour de veille. Sans elle, customElements.define lève « already defined »
// et la carte est définitivement cassée.
if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, EscaladeCard);
  ecLog(
    'info',
    'card',
    'élément enregistré à t=%dms après le début du chargement de la page',
    Math.round(performance.now())
  );
} else {
  ecLog('info', 'card', 'module déjà enregistré, ce chargement est ignoré');
}

/**
 * Répare les cartes d'erreur laissées orphelines par le rattrapage de HA.
 *
 * Quand HA construit la vue avant que ce module ne soit évalué, il fabrique une
 * carte « Custom element doesn't exist: escalade-card. », puis arme
 * customElements.whenDefined(tag) pour émettre 'll-rebuild' et la reconstruire.
 * Mais whenDefined se résout dans une microtâche : si notre définition arrive
 * juste après la création de la carte d'erreur, l'événement part avant que
 * hui-card n'ait attaché son écouteur, et se perd. Le setTimeout de 2 s de HA
 * révèle alors l'erreur définitivement.
 *
 * On réémet donc 'll-rebuild' nous-mêmes, plus tard, quand l'écouteur est en
 * place. Ciblé sur les seules cartes d'erreur qui nomment notre tag : une fois
 * reconstruites elles disparaissent, donc aucune boucle possible.
 */
function repairOrphanErrorCards(): number {
  let repaired = 0;
  const walk = (node: Element): void => {
    if (node.localName === 'hui-error-card') {
      const holder = node as unknown as {
        _config?: { message?: string };
        config?: { message?: string };
      };
      const message = (holder._config ?? holder.config)?.message ?? '';
      if (message.includes(CARD_TAG)) {
        node.dispatchEvent(new CustomEvent('ll-rebuild', { bubbles: true, composed: true }));
        repaired++;
      }
      return;
    }
    for (const child of [...(node.shadowRoot?.children ?? []), ...node.children]) {
      walk(child as Element);
    }
  };
  if (document.body) walk(document.body);
  return repaired;
}

// Plusieurs passes avant le seuil de 2 s à partir duquel HA rend l'erreur
// visible : la vue peut aussi se construire juste après notre définition. Ces
// timers ne dépendent d'aucun élément et ne sont annulés par rien — légitime,
// ils sont à usage unique et plafonnés à quatre secondes.
for (const delay of [0, 50, 150, 400, 1000, 2000, 4000]) {
  window.setTimeout(() => {
    try {
      // D'abord le registre : réémettre 'll-rebuild' ne sert à rien tant que HA
      // ne sait pas résoudre le tag.
      ensureRegisteredInCurrentRegistry();
      const repaired = repairOrphanErrorCards();
      if (repaired > 0) {
        ecLog(
          'warn',
          'card',
          "%d carte(s) d'erreur reconstruite(s) après %dms — la vue a été bâtie avant l'enregistrement de l'élément",
          repaired,
          delay
        );
      }
    } catch (e) {
      ecLog('error', 'card', "réparation des cartes d'erreur impossible : %o", e);
    }
  }, delay);
}

// Nécessaire au sélecteur de cartes. Rien en CI ne détecterait sa suppression.
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: 'Escalade Veauche',
    description: "Affiche les créneaux d'ouverture des Cimes Veauchoises",
  });
}
