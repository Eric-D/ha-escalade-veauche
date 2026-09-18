/** Classement d'un créneau : statut et délai.

Ces deux fonctions échouent en silence si elles se trompent — un créneau filtré
hors de la liste, un « demain » affiché sur un créneau de la semaine
prochaine — et rien en CI ne le verrait sans les tests qui les couvrent. Elles
sont aussi les seules de la carte à se tester sans DOM.
*/
import type { DelayChip, Slot, SlotStatus } from '../types.js';

/** Statut d'un créneau, dans le vocabulaire du filtre de la carte.

    `open` est un booléen ou `null` : comparer avec `==` classerait `null`
    comme fermé le jour où Python y mettrait autre chose. */
export function slotStatus(slot: Slot): SlotStatus {
  if (slot.open === true) return 'open';
  if (slot.open === false) return 'closed';
  return 'unknown';
}

/** Couleurs du statut. Le vert et le rouge sont ceux de la page du club :
    l'adhérent doit reconnaître son calendrier. */
export function statusColors(status: SlotStatus): { color: string; bg: string } {
  if (status === 'open') return { color: '#1b5e20', bg: '#c8e6c9' };
  if (status === 'closed') return { color: '#b71c1c', bg: '#ffcdd2' };
  return { color: '#37474f', bg: '#cfd8dc' };
}

export function statusLabel(status: SlotStatus): string {
  if (status === 'open') return 'Ouvert';
  if (status === 'closed') return 'Fermé';
  return 'Statut inconnu';
}

/** Délai d'ici le créneau, en langage courant.

    `days_left` est calculé côté Python dans le fuseau de Home Assistant. Le
    recalculer ici à partir de `date` reviendrait à utiliser le fuseau du
    navigateur, qui n'est pas forcément le même — un téléphone en voyage
    annoncerait « demain » sur le créneau de ce soir. */
export function getDelayChip(daysLeft: number | null | undefined): DelayChip {
  // Sans cette garde, un créneau sans days_left affichait « dans undefinedj ».
  if (typeof daysLeft !== 'number' || !Number.isFinite(daysLeft)) {
    return { type: 'unknown', text: 'date inconnue' };
  }
  if (daysLeft < 0) {
    // Les créneaux passés sont écartés côté Python ; celui-ci a traversé
    // minuit entre deux cycles. Le dire plutôt que l'afficher comme à venir.
    return { type: 'unknown', text: 'créneau passé' };
  }
  if (daysLeft === 0) return { type: 'today', text: "aujourd'hui" };
  if (daysLeft === 1) return { type: 'tomorrow', text: 'demain' };
  if (daysLeft <= 7) return { type: 'soon', text: `dans ${daysLeft} jours` };
  return { type: 'later', text: `dans ${daysLeft} jours` };
}
