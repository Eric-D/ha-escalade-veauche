"""Plateforme sensor.

Ce fichier ne contient que des classes d'entités et du câblage. Il n'est **pas
importable** sous les mocks de `tests/conftest.py` — `class
_EscaladeBase(CoordinatorEntity, SensorEntity)` lève un conflit de métaclasse
quand les deux bases sont des MagicMock — donc tout ce qui y vit est hors de
portée des tests, et la suite reste verte quoi qu'on y casse. Toute logique
doit aller dans `coordinator.py` ou `dates.py`.
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import ClassVar

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)
from homeassistant.util import dt as dt_util

from .const import (
    CALENDAR_URL,
    CONF_NOTIFY_WITHIN_DAYS,
    CONF_SCAN_INTERVAL,
    DEFAULT_NOTIFY_WITHIN_DAYS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)
from .coordinator import (
    STORAGE_VERSION,
    EscaladeConfigEntry,
    EscaladeDataSource,
    async_load_cache,
    build_unique_id,
)
from .dates import with_derived

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EscaladeConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Met en place les capteurs d'une entrée."""
    scan_interval = entry.options.get(
        CONF_SCAN_INTERVAL,
        entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
    )
    # Options d'abord, données ensuite : c'est l'ordre du flux d'options, et
    # l'inverse rendrait un réglage modifié sans effet jusqu'au prochain
    # passage par la reconfiguration.
    notify_within_days = entry.options.get(
        CONF_NOTIFY_WITHIN_DAYS,
        entry.data.get(CONF_NOTIFY_WITHIN_DAYS, DEFAULT_NOTIFY_WITHIN_DAYS),
    )

    # Indexé sur l'entry_id : c'est la seule clé qui ne dépend d'aucun réglage,
    # donc la seule qui ne fasse pas repartir d'un cache vide — capteurs
    # « unknown » jusqu'au premier fetch réussi, « unavailable » s'il échoue.
    store = Store(hass, STORAGE_VERSION, f"{DOMAIN}_{entry.entry_id}_cache")
    cached = await async_load_cache(store)
    state = {"last_success": cached.get("last_success")}
    source = EscaladeDataSource(
        hass, entry.runtime_data.client, store, cached, state, notify_within_days
    )

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        # Explicite plutôt que déduit du ContextVar : le lien entrée/coordinator
        # est ce qui permet à Home Assistant de rattacher un échec à l'entrée.
        config_entry=entry,
        name=DOMAIN,
        update_method=source.async_update,
        update_interval=timedelta(minutes=scan_interval),
    )

    # Le service refresh le retrouve par là.
    entry.runtime_data.coordinator = coordinator

    # Pré-remplissage depuis le cache : sans ça, les capteurs restent
    # « unknown » et la carte affiche son loader pendant tout le premier fetch,
    # à chaque démarrage de Home Assistant.
    if cached.get("data"):
        # Pas de fetch_ok=False ici : aucun fetch n'a encore échoué. Le poser
        # ferait apparaître le bandeau « synchronisation en échec » à chaque
        # démarrage dont le cache a plus de douze heures.
        coordinator.async_set_updated_data({
            **with_derived(cached["data"], dt_util.now().date()),
            "last_success": state["last_success"],
        })

    async_add_entities([
        EscaladeProchainOuvert(coordinator, entry),
        EscaladeProchainFerme(coordinator, entry),
        EscaladeCreneauxOuverts(coordinator, entry),
        EscaladeCreneauxFermes(coordinator, entry),
        EscaladeAujourdhui(coordinator, entry),
        EscaladeDerniereMaj(coordinator, entry, state),
    ])

    # Sans bloquer le setup de la plateforme : un site associatif lent ne doit
    # pas retarder le démarrage de Home Assistant.
    entry.async_create_background_task(
        hass, coordinator.async_request_refresh(), "escalade_first_refresh"
    )


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    """Appareil unique regroupant les capteurs de l'entrée.

    Identifié par l'entry_id et non par une donnée du site, pour la même raison
    que les identifiants uniques d'entités : rien de ce que l'utilisateur peut
    changer ne doit créer un second appareil et orpheliner le premier.
    """
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="Escalade Veauche",
        manufacturer="Les Cimes Veauchoises",
        configuration_url=CALENDAR_URL,
        entry_type=DeviceEntryType.SERVICE,
    )


class _EscaladeBase(CoordinatorEntity, SensorEntity):
    """Base commune : expose la fraîcheur des données à la carte."""

    def _freshness(self) -> dict:
        """Fraîcheur des données, exposée sur tous les capteurs de créneaux.

        Sans ça, la carte ne peut pas distinguer des données fraîches d'un
        cache vieux de plusieurs jours : le coordinator considère un repli sur
        cache comme un succès, donc les entités restent disponibles.
        """
        data = self.coordinator.data or {}
        return {
            "last_success": data.get("last_success"),
            "fetch_ok": data.get("fetch_ok", True),
            # Indispensable : sans horodatage qui bouge, deux échecs consécutifs
            # produisent des attributs identiques, HA dédoublonne l'écriture
            # d'état, la carte ne re-render pas et son bandeau de péremption
            # n'apparaît jamais une fois le seuil franchi.
            "last_error_at": data.get("last_error_at"),
            "horaires": data.get("horaires", {}),
        }


class _EscaladeProchainBase(_EscaladeBase):
    """Prochain créneau d'un statut donné, comme date.

    device_class DATE et non un compte de jours : l'historique d'un capteur de
    date reste lisible, et une automatisation peut le comparer à `now()` sans
    savoir comment nous comptons les jours.
    """

    _attr_device_class = SensorDeviceClass.DATE
    _key: str

    @property
    def native_value(self) -> date | None:
        slot = (self.coordinator.data or {}).get(self._key)
        if not isinstance(slot, dict):
            return None
        try:
            # Naïf : un créneau est un jour civil, pas un instant.
            return datetime.strptime(slot["date"], "%Y-%m-%d").date()  # noqa: DTZ007
        except (KeyError, TypeError, ValueError):
            return None

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        slot = self.coordinator.data.get(self._key) or {}
        return {
            "jour": slot.get("jour"),
            "date_display": slot.get("date_display"),
            "horaire": slot.get("horaire"),
            "days_left": slot.get("days_left"),
            "statut": slot.get("statut"),
            **self._freshness(),
        }


class EscaladeProchainOuvert(_EscaladeProchainBase):
    """Prochaine date d'ouverture annoncée."""

    _attr_icon = "mdi:calendar-check"
    _key = "next_open"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "next_open")
        self._attr_name = "Prochain créneau ouvert"


class EscaladeProchainFerme(_EscaladeProchainBase):
    """Prochaine date de fermeture annoncée."""

    _attr_icon = "mdi:calendar-remove"
    _key = "next_closed"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "next_closed")
        self._attr_name = "Prochain créneau fermé"


class _EscaladeListeBase(_EscaladeBase):
    """Compte de créneaux à venir, avec la liste en attribut.

    C'est le capteur que vise la carte : elle lit `creneaux`, et le compte ne
    sert qu'à donner un état lisible dans l'interface de Home Assistant.
    """

    _attr_native_unit_of_measurement = "créneaux"
    _count_key: str
    _open_filter: bool | None

    @property
    def native_value(self) -> int | None:
        if self.coordinator.data:
            return self.coordinator.data.get(self._count_key, 0)
        return None

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        upcoming = self.coordinator.data.get("upcoming") or []
        # `is` et non `==` : `open` vaut None quand le statut n'a pas été
        # compris, et `None == False` est faux mais `0 == False` est vrai —
        # un jour où une refonte y mettrait un entier, le filtre se tromperait
        # en silence.
        creneaux = [
            slot
            for slot in upcoming
            if self._open_filter is None or slot.get("open") is self._open_filter
        ]
        return {"creneaux": creneaux, **self._freshness()}


class EscaladeCreneauxOuverts(_EscaladeListeBase):
    """Créneaux ouverts à venir."""

    _attr_icon = "mdi:door-open"
    _count_key = "open_count"
    _open_filter = True

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "open_count")
        self._attr_name = "Créneaux ouverts"


class EscaladeCreneauxFermes(_EscaladeListeBase):
    """Créneaux fermés à venir."""

    _attr_icon = "mdi:door-closed-lock"
    _count_key = "closed_count"
    _open_filter = False

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "closed_count")
        self._attr_name = "Créneaux fermés"


class EscaladeAujourdhui(_EscaladeBase):
    """État du créneau du jour.

    Trois états et non un booléen : « pas de créneau aujourd'hui » n'est pas
    « fermé ». Le mardi fermé et le lundi sans créneau se ressemblent sur un
    tableau de bord, mais seul le premier est une information sur le club.

    Le capteur porte aussi la liste complète en attribut : c'est celui que la
    carte vise par défaut, parce que c'est le seul dont l'état soit lisible
    sans contexte dans l'interface de Home Assistant.
    """

    _attr_icon = "mdi:calendar-today"
    _attr_device_class = SensorDeviceClass.ENUM
    # ClassVar : sans l'annotation, ruff voit une valeur mutable partagée par
    # toutes les instances. C'est bien l'intention — la liste est une
    # constante de classe que Home Assistant lit, jamais modifiée.
    _attr_options: ClassVar[list[str]] = ["ouvert", "ferme", "inconnu", "hors_creneau"]

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "today")
        self._attr_name = "Escalade aujourd'hui"

    @property
    def native_value(self) -> str | None:
        data = self.coordinator.data
        if not data:
            return None
        slot = data.get("today")
        if not isinstance(slot, dict):
            return "hors_creneau"
        is_open = slot.get("open")
        if is_open is True:
            return "ouvert"
        if is_open is False:
            return "ferme"
        # Statut publié mais illisible. Surtout pas « fermé » : ça enverrait
        # l'adhérent grimper ailleurs un soir d'ouverture.
        return "inconnu"

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        slot = self.coordinator.data.get("today") or {}
        return {
            "jour": slot.get("jour"),
            "date": slot.get("date"),
            "date_display": slot.get("date_display"),
            "horaire": slot.get("horaire"),
            "statut": slot.get("statut"),
            # La liste complète des créneaux à venir : c'est elle que lit la
            # carte, qui applique ensuite ses propres filtres.
            "creneaux": self.coordinator.data.get("upcoming") or [],
            **self._freshness(),
        }


class EscaladeDerniereMaj(CoordinatorEntity, SensorEntity):
    """Horodatage du dernier relevé réussi."""

    _attr_icon = "mdi:clock-check-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(
        self, coordinator: DataUpdateCoordinator, entry: ConfigEntry, state: dict
    ) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "last_update")
        self._attr_name = "Dernière MAJ Escalade"
        self._state = state

    @property
    def native_value(self) -> datetime | None:
        ts = self._state.get("last_success")
        if ts:
            try:
                return datetime.fromisoformat(ts)
            except (ValueError, TypeError):
                pass
        return None
