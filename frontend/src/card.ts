import { LitElement, html, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import {
  ALL_STATUSES,
  ALL_WEEKDAYS,
  STATUS_ALIASES,
  type CalendarAttributes,
  type EscaladeConfig,
  type HassEntityState,
  type HassLike,
  type Slot,
  type SlotStatus,
} from './types.js';
import { slotStatus } from './helpers/slot.js';
import { RetryScheduler } from './helpers/retry.js';
import { renderHeader, renderLoader, renderStaleNotice } from './renders/chrome.js';
import { renderSlotRow } from './renders/slot-row.js';
import { logBanner, ecLog } from './version.js';
import { cardStyles } from './styles/card.js';

import './editor.js';

interface GridOptions {
  columns: number;
  min_columns: number;
  rows: number;
  min_rows: number;
}

export class EscaladeCard extends LitElement {
  static override styles = [cardStyles];

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
      '#%d setConfig accepté (entity=%s, jours=%s, statuts=%s) à t=%dms',
      this._id,
      entity || '(vide)',
      days ? days.join(',') : 'tous',
      statuses ? statuses.join(',') : 'tous',
      Math.round(performance.now())
    );

    const previous = this._config;
    this._config = { ...config, entity, days, statuses, max };

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

  public getCardSize(): number {
    return 4;
  }

  public getGridOptions(): GridOptions {
    return { columns: 12, min_columns: 6, rows: 4, min_rows: 2 };
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
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Aucun timer lié à un élément ne doit survivre à son détachement.
    this._retry.cancel();
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

  private _render(): TemplateResult {
    const title = this._config?.title ?? 'Créneaux escalade';

    if (!this._config) {
      return renderLoader({ title, message: 'En attente de configuration…' });
    }
    if (!this._hass) {
      return renderLoader({ title, message: 'Connexion à Home Assistant…' });
    }

    const entityId = this._config.entity;
    if (!entityId) {
      return renderLoader({ title, message: 'Sélectionnez une entité' });
    }

    const states = this._hass.states;
    if (!states) {
      ecLog('warn', 'card', 'hass.states absent, rendu du loader');
      this._retry.schedule();
      // Même règle que la branche « entité indisponible » : au-delà du quota
      // de retries, afficher indéfiniment le dernier rendu ferait passer des
      // créneaux périmés pour à jour.
      if (!this._retry.exhausted) {
        return (
          this._lastTemplate ??
          renderLoader({ title, message: 'En attente de Home Assistant…' })
        );
      }
      return renderLoader({ title, message: 'Données Home Assistant indisponibles' });
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
        return this._lastTemplate ?? renderLoader({ title });
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
        return renderLoader({ title, message: `${entityId} indisponible` });
      }
      // Une fois le quota épuisé, plus rien ne relancera la carte de lui-même :
      // un spinner perpétuel ferait croire à un chargement en cours.
      this._lastTemplate = renderLoader({
        title,
        message: this._retry.exhausted
          ? `Données indisponibles pour ${entityId}`
          : 'En attente des données…',
      });
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
      return renderLoader({ title, message: `${entityId} n'est pas un capteur Escalade` });
    }

    this._retry.reset();
    const tpl = this._renderCalendar(state, title);
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
