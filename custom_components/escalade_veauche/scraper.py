"""Lecture du calendrier public des Cimes Veauchoises.

Aucune authentification : la page est publique, il n'y a ni session, ni jeton,
ni compte. C'est la différence structurante avec ha-mediatheque-veauche, dont
ce dépôt reprend par ailleurs le cycle de vie — pas de `login()`, pas de
`ConfigEntryAuthFailed`, pas de flux de ré-authentification, et donc aucun
chemin d'erreur qui justifie de solliciter l'utilisateur.

Le scraper ne calcule **aucune** date relative. Il ne connaît que des jours
civils lus sur la page, et n'a pas accès à `hass` : y appeler `date.today()`
utiliserait le fuseau du système hôte — souvent UTC en conteneur alors que
Home Assistant est sur Europe/Paris — et décalerait « prochain créneau » d'un
jour pendant une partie de la journée. Tout ce qui dépend du jour courant vit
dans `dates.py` et n'est calculé qu'au moment de servir.
"""
from __future__ import annotations

import logging
import re
import unicodedata
from datetime import datetime

import requests
from bs4 import BeautifulSoup

from .const import CALENDAR_URL, WEEKDAYS_FR

_LOGGER = logging.getLogger(__name__)

TIMEOUT = 20

# « Mardi 15/09/2026 Ouvert. » — le point final et les espaces insécables du
# gabarit sont absorbés par \s* et le `.?` optionnel.
SLOT_PATTERN = re.compile(
    r"(?P<jour>[A-Za-zÀ-ÿ]+)\s+(?P<date>\d{2}/\d{2}/\d{4})\s+(?P<statut>[A-Za-zÀ-ÿ]+)\s*\.?",
    re.UNICODE,
)

# « Mardi (19h00-21h30) » dans le chapeau de la page.
SCHEDULE_PATTERN = re.compile(
    r"(?P<jour>[A-Za-zÀ-ÿ]+)\s*\((?P<horaire>[^)]{3,40})\)",
    re.UNICODE,
)

# Classes du gabarit, utilisées comme second avis sur le statut. Le libellé
# textuel reste la source primaire : c'est lui que lit l'adhérent sur la page,
# et un thème qui renommerait ses classes ne doit pas inverser un statut.
CLASS_OPEN = "progressgreen"
CLASS_CLOSED = "progressrouge"


class CalendarUnavailableError(Exception):
    """Le calendrier n'a pas pu être lu.

    Toujours transitoire du point de vue de l'utilisateur : il n'y a rien à
    ressaisir, donc rien à lui demander. Le coordinator retombe sur son cache.
    """


def _strip_accents(value: str) -> str:
    """Compare des libellés du site sans dépendre de ses accents.

    « Fermé » y est parfois écrit « Ferme », et la casse varie d'une saison à
    l'autre. Comparer la forme dépouillée évite de classer un créneau fermé
    comme inconnu — donc de l'afficher comme ouvert par défaut.
    """
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).casefold()


_WEEKDAY_INDEX = {_strip_accents(day): index for index, day in enumerate(WEEKDAYS_FR)}


def parse_status(text: str) -> bool | None:
    """True si ouvert, False si fermé, None si le libellé est inconnu.

    None, jamais False par défaut : afficher « fermé » sur un libellé qu'on n'a
    pas su lire enverrait l'adhérent au club un soir où il est ouvert, ou
    l'inverse. Un statut inconnu doit rester visiblement inconnu.
    """
    normalized = _strip_accents(text).strip(" .")
    if normalized.startswith("ouvert"):
        return True
    if normalized.startswith("ferme"):
        return False
    return None


def _status_from_class(li) -> bool | None:
    """Statut déduit de la barre colorée, en second avis."""
    span = li.find("span", class_="bar")
    if span is None:
        return None
    classes = span.get("class") or []
    if CLASS_OPEN in classes:
        return True
    if CLASS_CLOSED in classes:
        return False
    return None


def parse_schedule(html: str) -> dict[str, str]:
    """Horaires par jour de semaine, lus dans le chapeau du calendrier.

    Indexés par l'entier `weekday()` rendu en chaîne, et non par le libellé
    français : c'est la clé d'échange du reste du projet, et une clé d'attribut
    d'entité doit rester stable même si le site change sa typographie.

    Absence tolérée : le chapeau est éditorial, il a déjà été remanié. Une
    carte sans horaires reste utile, une carte qui ne s'affiche plus ne l'est
    pas.
    """
    soup = BeautifulSoup(html, "html.parser")
    header = soup.find("h1", class_="title")
    if header is None:
        _LOGGER.debug("Chapeau des horaires absent de la page")
        return {}

    schedule: dict[str, str] = {}
    for match in SCHEDULE_PATTERN.finditer(header.get_text(" ", strip=True)):
        index = _WEEKDAY_INDEX.get(_strip_accents(match.group("jour")))
        if index is None:
            continue
        # Premier gagnant : le chapeau cite parfois deux fois le même jour
        # (créneau adultes puis école d'escalade), et c'est le premier bloc qui
        # décrit les créneaux du calendrier.
        schedule.setdefault(str(index), match.group("horaire").strip())
    return schedule


def parse_calendar(html: str) -> list[dict]:
    """Créneaux annoncés, dans l'ordre de la page.

    Renvoie des dicts bruts : date ISO, jour, statut. Aucun champ dérivé du
    jour courant — voir la docstring du module.
    """
    soup = BeautifulSoup(html, "html.parser")
    container = soup.find("ul", id="skill")
    if container is None:
        raise CalendarUnavailableError(
            "Liste des créneaux introuvable : la page du calendrier a changé de structure"
        )

    slots: list[dict] = []
    seen: set[str] = set()
    for li in container.find_all("li"):
        match = SLOT_PATTERN.search(li.get_text(" ", strip=True))
        if match is None:
            _LOGGER.debug("Élément de calendrier non reconnu, ignoré")
            continue
        try:
            # Naïf à dessein : un créneau est un jour civil, pas un instant.
            day = datetime.strptime(match.group("date"), "%d/%m/%Y").date()  # noqa: DTZ007
        except ValueError:
            _LOGGER.warning("Date de créneau illisible: %r", match.group("date"))
            continue

        is_open = parse_status(match.group("statut"))
        from_class = _status_from_class(li)
        if is_open is None:
            # Le libellé n'a pas été compris : la barre colorée est le seul
            # recours avant d'abandonner le créneau.
            is_open = from_class
        elif from_class is not None and from_class != is_open:
            # Divergence : le texte gagne, c'est ce que l'adhérent lit. On le
            # signale, parce que c'est le symptôme d'un gabarit qui a bougé et
            # que rien d'autre ne le dirait.
            _LOGGER.warning(
                "Statut contradictoire pour le %s : texte %r, couleur %s",
                match.group("date"),
                match.group("statut"),
                "ouvert" if from_class else "fermé",
            )

        iso = day.isoformat()
        if iso in seen:
            # Le site a déjà publié deux fois la même date lors d'un changement
            # de saison. Garder la première évite un doublon dans la carte.
            _LOGGER.debug("Date en double dans le calendrier, ignorée: %s", iso)
            continue
        seen.add(iso)

        weekday = day.weekday()
        slots.append({
            "date": iso,
            "date_display": match.group("date"),
            "weekday": weekday,
            "jour": WEEKDAYS_FR[weekday],
            "statut": match.group("statut").strip(" ."),
            # None possible : ni le texte ni la couleur n'ont été compris.
            "open": is_open,
        })

    if not slots:
        raise CalendarUnavailableError(
            "Aucun créneau lisible sur la page du calendrier"
        )
    # Tri par date : la page est chronologique aujourd'hui, mais rien ne le
    # garantit, et tout l'aval (prochain créneau, carte) suppose cet ordre.
    slots.sort(key=lambda slot: slot["date"])
    return slots


class CimesVeauchoisesClient:
    """Client HTTP du calendrier public.

    Pas de session persistante : une requête par cycle, sans cookie ni état à
    conserver. Un `requests.Session` n'apporterait ici qu'un objet à invalider
    au rechargement de l'entrée.
    """

    def __init__(self, url: str = CALENDAR_URL) -> None:
        self._url = url

    def fetch_all(self) -> dict:
        """Récupère et analyse le calendrier. Appelé dans un thread d'exécuteur.

        Bloquant à dessein : `requests` ne doit jamais être appelé depuis la
        boucle d'événements. La règle ASYNC de ruff verrouille ce point.
        """
        try:
            response = requests.get(
                self._url,
                timeout=TIMEOUT,
                headers={"User-Agent": "HomeAssistant/EscaladeVeauche/1.0"},
            )
            response.raise_for_status()
        except requests.RequestException as err:
            raise CalendarUnavailableError(
                f"Calendrier injoignable : {err}"
            ) from err

        # Le serveur déclare « charset=UTF-8 » dans son en-tête, donc requests
        # décode correctement. Le repli couvre le jour où il ne le déclarerait
        # plus : requests retombe alors sur latin-1 pour tout text/*, « Fermé »
        # devient illisible, et le statut partirait sur le repli par couleur.
        if not response.encoding:
            response.encoding = "utf-8"
        html = response.text

        creneaux = parse_calendar(html)
        _LOGGER.info("Calendrier récupéré : %d créneaux annoncés", len(creneaux))
        return {
            "creneaux": creneaux,
            "horaires": parse_schedule(html),
        }
