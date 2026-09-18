/** Statut d'un créneau, tel que la carte le filtre.

`unknown` n'est pas décoratif : le scraper renvoie `open: null` quand ni le
libellé ni la couleur de la page n'ont été compris, et ce cas doit rester
visible. Le masquer par défaut afficherait un calendrier qui paraît complet
alors qu'il lui manque une soirée. */
export type SlotStatus = 'open' | 'closed' | 'unknown';

export const ALL_STATUSES: readonly SlotStatus[] = ['open', 'closed', 'unknown'] as const;

// Alias acceptés pour les vieux tableaux de bord. Important : ne JAMAIS en
// retirer un, sinon une carte encore en YAML casse avec « Erreur de
// configuration ».
export const STATUS_ALIASES: Record<string, SlotStatus> = {
  ouvert: 'open',
  ferme: 'closed',
  'fermé': 'closed',
  inconnu: 'unknown',
};

/** Indices de `datetime.weekday()` : 0 = lundi … 6 = dimanche.

    C'est la clé d'échange avec Python, et elle ne doit pas être recalculée en
    TypeScript à partir de la date : `Date.getDay()` compte à partir du
    dimanche, donc tout décalerait d'un rang sans qu'aucun type ne le voie. */
export const ALL_WEEKDAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6] as const;

export const WEEKDAY_LABELS: readonly string[] = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

export interface EscaladeConfig {
  type?: string;
  entity: string;
  title?: string;
  /** Jours de semaine affichés. Absent = tous. */
  days?: number[];
  /** Statuts affichés. Absent = tous. */
  statuses?: SlotStatus[];
  /** Nombre maximal de créneaux affichés. Absent = pas de limite. */
  max?: number;
}

/** Un créneau tel que l'intégration le sert.

    Les champs optionnels arrivent en `null` depuis Python, pas en `undefined` :
    les typer `?: string` inviterait un `=== undefined` ou un `??` silencieusement
    faux. */
export interface Slot {
  date: string;
  date_display: string;
  weekday: number;
  jour: string;
  statut: string;
  /** null = ni le libellé ni la couleur de la page n'ont été compris. */
  open: boolean | null;
  /** Dérivés côté Python au moment de servir : jamais écrits dans le cache
      disque, et jamais recalculés ici — la carte ne connaît pas le fuseau
      configuré dans Home Assistant. null = date illisible, surtout pas 0 qui
      veut dire « aujourd'hui ». */
  days_left?: number | null;
  past?: boolean;
  horaire?: string | null;
}

/** Fraîcheur des données, exposée par tous les capteurs de créneaux. */
export interface FreshnessAttributes {
  last_success?: string | null;
  fetch_ok?: boolean;
  // Jamais lu par la carte : son seul rôle est de faire varier les attributs
  // à chaque échec, sans quoi HA dédoublonne l'écriture d'état et la carte ne
  // re-render pas.
  last_error_at?: string | null;
}

export interface CalendarAttributes extends FreshnessAttributes {
  creneaux?: Slot[];
  horaires?: Record<string, string>;
  jour?: string | null;
  horaire?: string | null;
}

export interface DelayChip {
  type: 'today' | 'tomorrow' | 'soon' | 'later' | 'unknown';
  text: string;
}

export interface HassEntityState {
  state: string;
  attributes: Record<string, unknown>;
}

export interface HassLike {
  states: Record<string, HassEntityState | undefined>;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ) => Promise<unknown>;
}
