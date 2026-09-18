"""Détection des changements d'état d'un créneau.

Le club annonce ses créneaux à la main, et **les corrige** : un mardi annoncé
ouvert bascule en fermé la veille au soir parce qu'aucun encadrant n'est
disponible. C'est l'information la plus utile de tout le site, et c'est
précisément celle qu'un tableau de bord consulté une fois par semaine rate.

D'où un événement Home Assistant à chaque bascule, que l'utilisateur branche
sur l'automatisation de son choix. L'intégration ne décide pas du canal de
notification : elle n'a pas à savoir si l'adhérent veut une notification
mobile, une lampe rouge ou rien du tout.

Fonctions pures, sans `hass` : c'est ce qui les rend testables, et le motif
vaut pour les mêmes raisons que `dates.py`.
"""
from __future__ import annotations

import logging
from typing import Any

_LOGGER = logging.getLogger(__name__)

EVENT_SLOT_CHANGED = "escalade_veauche_slot_changed"

# Types de changement portés par l'événement. Trois et non deux : un créneau
# nouvellement annoncé n'est pas une bascule, et une automatisation qui
# prévient « le créneau de mardi vient de fermer » ne doit pas se déclencher
# sur une date que le club vient simplement d'ajouter.
CHANGE_OPENED = "opened"
CHANGE_CLOSED = "closed"
CHANGE_ADDED = "added"


def _status_name(is_open: bool | None) -> str:
    """Vocabulaire commun à l'événement et au capteur du jour."""
    if is_open is True:
        return "ouvert"
    if is_open is False:
        return "ferme"
    return "inconnu"


def diff_slots(
    previous: list[dict] | None,
    current: list[dict],
    within_days: int,
) -> list[dict[str, Any]]:
    """Changements d'état survenus entre deux relevés, dans l'horizon donné.

    `within_days` est un nombre de jours **à venir** : au-delà, le club a
    encore tout le temps de changer d'avis, et prévenir à chaque fois
    apprendrait à ignorer les notifications. 0 désactive tout.

    `previous` à None — premier relevé après une installation, ou cache
    illisible — ne produit **aucun** événement. Sans cette règle, une
    installation neuve enverrait vingt notifications d'un coup, et un
    utilisateur dont le cache a été purgé recevrait le calendrier entier comme
    s'il venait de changer.

    Les créneaux comparés le sont **par date**, jamais par position : le club
    retire les créneaux passés en tête de liste, donc les index glissent d'un
    relevé à l'autre et une comparaison positionnelle signalerait des bascules
    imaginaires à chaque semaine qui passe.
    """
    if within_days <= 0 or previous is None:
        return []

    before = {
        slot["date"]: slot
        for slot in previous
        if isinstance(slot, dict) and isinstance(slot.get("date"), str)
    }

    changes: list[dict[str, Any]] = []
    for slot in current:
        if not isinstance(slot, dict):
            continue
        days_left = slot.get("days_left")
        # None exclu explicitement : une date illisible n'a pas d'horizon, et
        # `None <= 7` lèverait. Les créneaux passés le sont aussi — le club
        # corrige parfois une date révolue, ce qui n'intéresse personne.
        if not isinstance(days_left, int) or days_left < 0 or days_left > within_days:
            continue

        known = before.get(slot["date"])
        if known is None:
            change = CHANGE_ADDED
            was = None
        else:
            if known.get("open") == slot.get("open"):
                continue
            was = known.get("open")
            change = CHANGE_OPENED if slot.get("open") is True else CHANGE_CLOSED

        changes.append({
            "change": change,
            "date": slot.get("date"),
            "date_display": slot.get("date_display"),
            "jour": slot.get("jour"),
            "weekday": slot.get("weekday"),
            "horaire": slot.get("horaire"),
            "days_left": days_left,
            "was": _status_name(was) if known is not None else None,
            "now": _status_name(slot.get("open")),
            # Le libellé exact de la page, pour un message qui cite le club
            # plutôt que notre vocabulaire interne.
            "statut": slot.get("statut"),
        })

    return changes
