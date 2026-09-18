"""Tout ce qui dépend du jour courant, dans le fuseau de Home Assistant.

Le scraper ne calcule rien de relatif : il n'a pas accès à `hass` et
`date.today()` y suivrait le fuseau du **système hôte**, souvent UTC en
conteneur alors que Home Assistant est configuré sur Europe/Paris. « Prochain
créneau » aurait alors sauté le créneau du soir même pendant les heures où les
deux fuseaux ne sont pas le même jour — précisément le défaut que la
médiathèque a mis longtemps à voir sur ses délais d'emprunt.

Le calcul vit donc ici, appelé par le coordinator au moment de **servir** les
données. Corollaire utile : les décomptes sont recalculés à chaque cycle, y
compris sur le repli en cache. Le cache disque garde la sortie brute du
scraper ; y écrire `days_left` la figerait à la date du scrape, et une journée
d'indisponibilité du site servirait « dans 3 jours » pour un créneau passé.
"""
from __future__ import annotations

import logging
from datetime import date, datetime

_LOGGER = logging.getLogger(__name__)


def days_until(iso_date: str | None, today: date) -> int | None:
    """Nombre de jours d'ici `iso_date`. Négatif si la date est passée.

    None si la date est illisible ou absente : 0 signifierait « aujourd'hui »,
    c'est-à-dire une information fausse mise en avant sur la carte.
    """
    if not isinstance(iso_date, str):
        return None
    try:
        # Naïf à dessein : un créneau est un jour civil, pas un instant. Le
        # fuseau est porté par `today`, que l'appelant tire de la configuration
        # de Home Assistant.
        day = datetime.strptime(iso_date, "%Y-%m-%d").date()  # noqa: DTZ007
    except ValueError:
        _LOGGER.warning("Date de créneau illisible: %r", iso_date)
        return None
    return (day - today).days


def with_derived(data: dict, today: date) -> dict:
    """Copie de `data` enrichie de tout ce qui dépend du jour courant.

    Copie, jamais mutation : `coordinator.data` est comparé aux attributs des
    entités à chaque écriture d'état. Muter en place laisserait l'ancien State
    référencer les mêmes dicts, la comparaison les verrait déjà modifiés, aucun
    `state_changed` ne serait émis, et le passage de minuit n'apparaîtrait sur
    la carte qu'au cycle suivant — soit une heure plus tard par défaut, ce qui
    veut dire un créneau du jour annoncé « demain » jusqu'à 1 h du matin.

    Un seul point d'entrée pour toutes les dérivations, et non une fonction par
    champ : les trois chemins qui servent des données — fetch réussi, repli sur
    cache, pré-remplissage au démarrage — doivent appliquer exactement les
    mêmes. Les appeler une par une à trois endroits est la forme qui laisse un
    chemin en oublier une, en silence.
    """
    creneaux = data.get("creneaux")
    if not isinstance(creneaux, list):
        return data

    horaires = data.get("horaires") if isinstance(data.get("horaires"), dict) else {}
    dated: list[dict] = []
    for slot in creneaux:
        if not isinstance(slot, dict):
            continue
        days_left = days_until(slot.get("date"), today)
        dated.append({
            **slot,
            "days_left": days_left,
            # None ne vaut pas « passé » : un créneau dont la date est illisible
            # ne doit ni être compté dans les prochains, ni être masqué comme
            # révolu. Il reste visible, avec son délai inconnu.
            "past": days_left is not None and days_left < 0,
            # Recopié sur chaque créneau : la carte affiche l'horaire à côté de
            # la date, et lui faire croiser deux attributs pour ça l'obligerait
            # à connaître la convention de clé.
            "horaire": horaires.get(str(slot.get("weekday"))),
        })

    upcoming = [slot for slot in dated if not slot["past"]]
    open_upcoming = [slot for slot in upcoming if slot.get("open") is True]
    closed_upcoming = [slot for slot in upcoming if slot.get("open") is False]

    # `today` et non `upcoming[0]` : le premier créneau à venir peut être dans
    # trois jours, et « aujourd'hui » doit alors rester vide plutôt que
    # d'annoncer l'état d'un autre jour.
    today_slot = next(
        (slot for slot in dated if slot.get("days_left") == 0),
        None,
    )

    return {
        **data,
        "creneaux": dated,
        "horaires": horaires,
        "upcoming": upcoming,
        "next_open": open_upcoming[0] if open_upcoming else None,
        "next_closed": closed_upcoming[0] if closed_upcoming else None,
        "open_count": len(open_upcoming),
        "closed_count": len(closed_upcoming),
        "upcoming_count": len(upcoming),
        "today": today_slot,
    }
