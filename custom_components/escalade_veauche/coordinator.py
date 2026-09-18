"""Obtention et mise en cache des données, hors de toute classe d'entité.

Ce module n'hérite de rien et n'importe que des symboles simulables : c'est ce
qui le rend importable sous les mocks de `tests/conftest.py`. `sensor.py` ne
l'est pas — `class _EscaladeBase(CoordinatorEntity, SensorEntity)` lève un
conflit de métaclasse quand les deux bases sont des MagicMock — donc tout ce
qui y vivrait serait hors de portée des tests, et la suite resterait verte
quoi qu'on y casse.

**Ne pas remettre de logique dans `sensor.py`**, ni dans une closure de
`async_setup_entry` : ce qui y entre devient invisible aux tests sans que rien
ne le signale. Ce qui décide de ce que voit l'adhérent quand le site du club
est en panne — repli sur cache, marquage de fraîcheur — doit rester ici.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .changes import EVENT_SLOT_CHANGED, diff_slots
from .dates import with_derived
from .scraper import CimesVeauchoisesClient

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1


@dataclass
class EscaladeRuntimeData:
    """Ce que l'intégration garde en mémoire pour une entrée.

    Porté par `entry.runtime_data` et non par `hass.data[DOMAIN][entry_id]` :
    c'est ce que Home Assistant prévoit depuis 2024.6, et il le supprime
    lui-même au déchargement réussi — un dictionnaire global devrait être vidé
    à la main, et une entrée jamais chargée y laisserait son client jusqu'au
    redémarrage.

    `coordinator` est posé par la plateforme sensor, qui le construit : il
    n'existe pas encore quand `async_setup_entry` remplit le reste.
    """

    client: CimesVeauchoisesClient
    coordinator: DataUpdateCoordinator | None = None


type EscaladeConfigEntry = ConfigEntry[EscaladeRuntimeData]


def build_unique_id(entry_id: str, suffix: str) -> str:
    """Identifiant unique d'une entité.

    Dérivé de l'`entry_id`, **jamais** d'une donnée du site ou d'une option.
    Un identifiant qui dépend d'un réglage signifie qu'en changer crée des
    entités neuves et orpheline les anciennes : tableau de bord cassé,
    historique perdu, automatisations muettes. La médiathèque a payé cette
    leçon sur son login ; ici rien ne varie, et c'est exactement pourquoi il
    faut que ça reste vrai.
    """
    return f"{entry_id}_{suffix}"


def is_valid_payload(data: object) -> bool:
    """Vérifie qu'un payload — souvent relu du cache disque — a la forme attendue.

    Le `Store` versionne le conteneur, pas le contenu : un cache écrit par une
    version antérieure peut manquer de clés et faire lever les capteurs à
    chaque écriture d'état. Mieux vaut l'ignorer que casser l'intégration.
    """
    if not isinstance(data, dict):
        return False
    creneaux = data.get("creneaux")
    if not isinstance(creneaux, list):
        return False
    for slot in creneaux:
        if not isinstance(slot, dict):
            return False
        if not isinstance(slot.get("date"), str):
            return False
        # `open` vaut None quand ni le libellé ni la couleur n'ont été compris.
        # C'est une valeur légitime, pas un cache corrompu.
        if slot.get("open") not in (True, False, None):
            return False
    horaires = data.get("horaires")
    return horaires is None or isinstance(horaires, dict)


async def async_load_cache(store: Store) -> dict:
    """Relit le cache disque, en écartant ce qui n'est pas exploitable."""
    cached = await store.async_load() or {}
    if not isinstance(cached, dict):
        _LOGGER.warning("Cache disque corrompu (conteneur %s), ignoré", type(cached).__name__)
        return {}
    if cached.get("data") is not None and not is_valid_payload(cached["data"]):
        _LOGGER.warning(
            "Cache disque au format inattendu (écrit par une version antérieure ?), ignoré"
        )
        cached.pop("data", None)
        cached.pop("last_success", None)
    return cached


class EscaladeDataSource:
    """Méthode de mise à jour du coordinator, et le cache qui va avec.

    `state` est partagé avec le capteur « Dernière mise à jour » : il le lit
    pour sa valeur. `coordinator` est posé après coup par l'appelant, le
    coordinator ayant besoin de `async_update` pour être construit.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: Any,
        store: Store,
        cached: dict,
        state: dict,
        notify_within_days: int,
    ) -> None:
        self.hass = hass
        self.client = client
        self.store = store
        self.cached = cached
        self.state = state
        # Requis, jamais optionnel. Un défaut à 0 désactiverait les
        # notifications en silence si l'appelant l'oubliait — aucune erreur,
        # aucun log, et la CI au vert : exactement le genre de défaut que
        # `read_status` a déjà valu au dépôt d'origine.
        self.notify_within_days = notify_within_days
        self.coordinator: Any = None
        # Amorcé sur le cache et non sur None : ce qui a changé pendant que
        # Home Assistant était arrêté est une vraie nouvelle, et c'est même le
        # cas le plus utile — la bascule de la veille au soir. Le cache absent
        # laisse `None`, ce qui supprime tout événement au premier relevé d'une
        # installation neuve.
        previous = cached.get("data")
        self._previous_slots: list[dict] | None = (
            previous.get("creneaux") if isinstance(previous, dict) else None
        )

    def _fire_changes(self, creneaux: list[dict]) -> None:
        """Émet un événement par créneau dont l'état a basculé.

        Sur le bus et non en notification persistante : l'intégration n'a pas à
        savoir si l'adhérent veut une notification mobile, une lampe rouge ou
        rien du tout. Une automatisation branchée sur cet événement le décide.

        Le journal des changements est tenu **avant** l'émission : une
        exception d'un écouteur ne doit pas faire rejouer les mêmes événements
        au cycle suivant.
        """
        previous = self._previous_slots
        self._previous_slots = creneaux
        for change in diff_slots(previous, creneaux, self.notify_within_days):
            _LOGGER.info(
                "Créneau du %s : %s → %s",
                change["date"],
                change["was"] or "(nouveau)",
                change["now"],
            )
            self.hass.bus.async_fire(EVENT_SLOT_CHANGED, change)

    def _today(self) -> date:
        """Date du jour dans le fuseau de Home Assistant, pas celui de l'hôte."""
        return dt_util.now().date()

    async def async_update(self) -> dict:
        """Récupère le calendrier, avec repli sur le cache disque.

        Aucun chemin de ré-authentification, contrairement à la médiathèque :
        la page est publique, donc **tout** échec est transitoire et rien n'est
        à ressaisir. Lever `ConfigEntryAuthFailed` ici afficherait à l'adhérent
        une notification « Reconfigurer » devant laquelle il n'aurait rien à
        faire.
        """
        try:
            raw = await self.hass.async_add_executor_job(self.client.fetch_all)
        except Exception as err:
            _LOGGER.warning("Échec de la mise à jour du calendrier: %s", err)
            if self.cached.get("data"):
                _LOGGER.info(
                    "Utilisation du calendrier en cache (dernier succès: %s)",
                    self.state["last_success"],
                )
                # Copie marquée : sans horodatage d'échec, le payload serait
                # identique au cycle précédent, Home Assistant dédoublonnerait
                # l'écriture d'état, et la carte n'aurait aucun moyen de savoir
                # que ce qu'elle affiche est périmé.
                # Aucun événement sur ce chemin : les créneaux sont ceux du
                # dernier relevé réussi, donc rien n'a changé. En émettre
                # préviendrait d'une bascule qui n'a pas eu lieu.
                return {
                    # Recalculé ici aussi : c'est le seul chemin où les données
                    # peuvent traverser un minuit sans nouveau scrape. Sans ça,
                    # un site en panne depuis deux jours annoncerait encore
                    # « ce soir » pour un créneau de l'avant-veille.
                    **with_derived(self.cached["data"], self._today()),
                    "last_success": self.state["last_success"],
                    "fetch_ok": False,
                    "last_error_at": dt_util.utcnow().isoformat(),
                }
            raise UpdateFailed(f"Calendrier indisponible : {err}") from err

        self.state["last_success"] = dt_util.utcnow().isoformat()
        # Le cache disque reçoit la sortie brute du scraper : y écrire les
        # marqueurs de fraîcheur — ou les délais, qui dépendent du jour — les
        # figerait pour la prochaine relecture.
        self.cached["data"] = raw
        self.cached["last_success"] = self.state["last_success"]
        await self.store.async_save(self.cached)

        data = with_derived(raw, self._today())
        # Après l'écriture du cache : un événement émis pour un relevé qu'on
        # n'aurait pas su persister serait rejoué au démarrage suivant.
        self._fire_changes(data["creneaux"])
        _LOGGER.info(
            "Calendrier à jour : %d créneaux à venir, %d ouverts, %d fermés",
            data.get("upcoming_count", 0),
            data.get("open_count", 0),
            data.get("closed_count", 0),
        )
        return {**data, "last_success": self.state["last_success"], "fetch_ok": True}
