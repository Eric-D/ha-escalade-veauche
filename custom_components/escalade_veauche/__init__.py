"""Intégration Escalade Veauche — calendrier des créneaux des Cimes Veauchoises."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import homeassistant.helpers.config_validation as cv
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers.start import async_at_started

from .const import DOMAIN
from .coordinator import EscaladeConfigEntry, EscaladeRuntimeData
from .scraper import CimesVeauchoisesClient

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_VERSION = "0.4.0"
CARD_URL = f"/{DOMAIN}/escalade-card.js"
# Même URL exacte pour les deux mécanismes d'injection : un module ES n'est
# évalué qu'une fois par URL, donc le double enregistrement est gratuit et ne
# produit ni double téléchargement ni double bannière.
CARD_RESOURCE_URL = f"{CARD_URL}?v={CARD_VERSION}"

# Sans ce schéma, Home Assistant n'a aucun moyen de savoir que le domaine
# n'accepte pas de configuration YAML : un « escalade_veauche: » égaré dans
# configuration.yaml serait accepté en silence au lieu d'être signalé.
# hassfest le réclame dès lors qu'async_setup est défini.
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

SERVICE_REFRESH = "refresh"


def _calendar_entries(hass: HomeAssistant) -> list[tuple[str, EscaladeRuntimeData]]:
    """Entrées utilisables, dans l'ordre d'ajout à la collection.

    Deux filtres, et les deux sont nécessaires :

    - `runtime_data` n'existe pas tant qu'`async_setup_entry` ne l'a pas posé,
      et Home Assistant le supprime **au déchargement réussi seulement**. Ça
      écarte les entrées désactivées, ignorées et déchargées, sans rien
      entretenir à la main.
    - l'état, parce que `runtime_data` est posé en première instruction et
      **survit à un setup qui échoue ensuite** — HA ne le supprime que sur le
      chemin du déchargement. Sans ce filtre, une entrée restée en erreur
      compte encore comme utilisable et retient le service `refresh`
      indéfiniment.
    """
    return [
        (entry.entry_id, data)
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is ConfigEntryState.LOADED
        and (data := getattr(entry, "runtime_data", None)) is not None
    ]


async def _async_refresh(hass: HomeAssistant) -> None:
    """Force un relevé du calendrier, hors du cycle de poll.

    Au niveau module et non dans une closure : c'est le seul moyen de tester le
    câblage. Ce qui entre dans une closure de `async_setup_entry` devient
    invisible aux tests sans que rien ne le signale.
    """
    entries = _calendar_entries(hass)
    if not entries:
        raise ServiceValidationError(
            "Aucun calendrier d'escalade configuré : rien à rafraîchir"
        )

    failures: list[str] = []
    for entry_id, entry_data in entries:
        coordinator = entry_data.coordinator
        if coordinator is None:
            # La plateforme sensor n'a pas fini son setup. Sauter cette entrée
            # plutôt que lever : les autres doivent être rafraîchies.
            _LOGGER.debug("Entrée %s sans coordinator, rafraîchissement ignoré", entry_id)
            continue
        try:
            # async_refresh et non async_request_refresh : le service doit avoir
            # abouti quand il rend la main, sinon une automatisation qui lit le
            # capteur juste après lit la valeur d'avant.
            await coordinator.async_refresh()
        except Exception as err:
            # Volontairement large : une entrée en échec ne doit pas empêcher
            # les autres d'être rafraîchies.
            _LOGGER.warning("Rafraîchissement de %s en échec: %s", entry_id, err)
            failures.append(str(err))

    if failures and len(failures) == len(entries):
        raise HomeAssistantError(
            "Le rafraîchissement du calendrier a échoué : " + failures[0]
        )


def _get_lovelace_resources(hass: HomeAssistant):
    """Récupère la collection de ressources Lovelace, ou None si indisponible.

    On sonde défensivement plutôt que d'importer le composant lovelace : un
    import créerait une dépendance que hassfest exigerait de déclarer dans le
    manifeste.

    Pas de repli sur `lovelace.get("resources")` : `hass.data["lovelace"]` était
    un dict jusqu'en 2025.1, c'est la dataclass `LovelaceData` depuis 2025.2, et
    le plancher de ce dépôt est 2026.1.
    """
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None
    resources = getattr(lovelace, "resources", None)
    if resources is None:
        return None
    # Mode YAML : collection en lecture seule, les ressources sont déclarées
    # dans configuration.yaml et c'est à l'utilisateur de le faire.
    if getattr(resources, "store", None) is None:
        return None
    return resources


async def _async_register_lovelace_resource(hass: HomeAssistant) -> bool:
    """Déclare la carte comme ressource Lovelace. True si c'est en place.

    **C'est le mécanisme à privilégier, et ce n'est pas qu'une question
    d'ordre.** Home Assistant charge `@webcomponents/scoped-custom-element-
    registry`, qui REMPLACE `window.customElements` par sa propre
    implémentation et sa propre table, sans jamais consulter le registre natif.
    Un module injecté par `add_extra_js_url` est évalué avant ce remplacement :
    sa définition atterrit dans le registre natif et reste invisible à HA, qui
    affiche « Custom element doesn't exist » de façon définitive.

    Les ressources Lovelace sont chargées par le panneau (`ha-panel-lovelace`),
    donc toujours après l'installation du polyfill. C'est exactement pourquoi
    les cartes distribuées en ressource — auto-entities, card-mod, mushroom —
    ne rencontrent jamais ce problème.

    Contre-intuitif, et ce qui a fait perdre le plus de temps sur le dépôt dont
    celui-ci est issu : c'est le chargement le **plus rapide** qui échoue, le
    polyfill s'installant vers 110-130 ms.
    """
    try:
        resources = _get_lovelace_resources(hass)
        if resources is None:
            return False

        if not resources.loaded:
            await resources.async_get_info()

        for item in resources.async_items():
            url = item.get("url", "")
            if url.split("?")[0] != CARD_URL:
                continue
            if url == CARD_RESOURCE_URL:
                return True
            # Version changée : on met à jour plutôt que d'accumuler les
            # doublons, sinon deux versions du module coexisteraient et la
            # première enregistrée gagnerait.
            await resources.async_update_item(item["id"], {"url": CARD_RESOURCE_URL})
            _LOGGER.info("Ressource Lovelace mise à jour : %s", CARD_RESOURCE_URL)
            return True

        await resources.async_create_item(
            {"res_type": "module", "url": CARD_RESOURCE_URL}
        )
        _LOGGER.info("Ressource Lovelace enregistrée : %s", CARD_RESOURCE_URL)
        return True
    except Exception:
        # Volontairement large : l'enregistrement de la ressource ne doit jamais
        # empêcher le setup de l'intégration. À défaut, la carte reste injectée
        # par add_extra_js_url.
        _LOGGER.exception("Enregistrement de la ressource Lovelace impossible")
        return False


async def _async_setup_card(hass: HomeAssistant) -> None:
    """Rend la carte disponible, par le chemin le plus sûr d'abord."""
    if await _async_register_lovelace_resource(hass):
        return

    # Repli : mode YAML, ou API des ressources inattendue. La carte sera
    # injectée dans le document, donc potentiellement évaluée avant le polyfill
    # de registre — le module sait se ré-enregistrer dans ce cas, mais mieux
    # vaut que l'utilisateur sache pourquoi.
    _LOGGER.warning(
        "Ressources Lovelace non modifiables (mode YAML ?) : repli sur "
        "add_extra_js_url. Pour un chargement plus fiable, déclarez la "
        "ressource vous-même : url %s, type « module ».",
        CARD_RESOURCE_URL,
    )
    add_extra_js_url(hass, CARD_RESOURCE_URL)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Setup global, une seule fois au démarrage de Home Assistant."""
    if DOMAIN + "_static_registered" in hass.data:
        return True

    card_path = Path(__file__).parent / "www" / "escalade-card.js"
    if not card_path.is_file():
        # Sans ce garde-fou on déclarerait une ressource vers une URL en 404 :
        # la carte ne serait jamais définie et HA afficherait une carte en
        # erreur sans que rien n'apparaisse dans les logs.
        _LOGGER.error(
            "Fichier de la carte introuvable (%s) — la carte Lovelace ne sera "
            "pas disponible. Réinstallez l'intégration via HACS puis redémarrez "
            "Home Assistant.",
            card_path,
        )
        hass.data[DOMAIN + "_static_registered"] = True
        return True

    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), False)]
    )

    # Après le démarrage : le composant lovelace n'est pas encore configuré au
    # moment où async_setup tourne.
    async_at_started(hass, _async_setup_card)

    hass.data[DOMAIN + "_static_registered"] = True
    return True


async def async_setup_entry(hass: HomeAssistant, entry: EscaladeConfigEntry) -> bool:
    """Met en place une entrée de configuration."""
    entry.runtime_data = EscaladeRuntimeData(client=CimesVeauchoisesClient())

    if not hass.services.has_service(DOMAIN, SERVICE_REFRESH):
        async def handle_refresh(call: ServiceCall) -> None:
            """Point d'entrée du service ; la logique est testable au niveau module."""
            await _async_refresh(hass)

        hass.services.async_register(DOMAIN, SERVICE_REFRESH, handle_refresh)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


@callback
def update_entry_and_ensure_reload(
    hass: HomeAssistant, entry: ConfigEntry, **updates: Any
) -> None:
    """Met à jour l'entrée en garantissant qu'elle sera rechargée.

    Pas `async_update_reload_and_abort` : il programme lui-même un rechargement
    alors qu'un listener de mise à jour est enregistré, ce que Home Assistant
    déprécie avec une casse annoncée en 2026.12.

    Deux cas n'appellent aucun listener et exigent donc un rechargement
    explicite :

    - l'entrée n'a pas changé — reconfiguration rouverte puis resoumise à
      l'identique — `async_update_entry` renvoyant alors `False` sans rien
      notifier ;
    - aucun listener n'est enregistré : entrée désactivée, ou
      `async_setup_entry` interrompu avant `add_update_listener`.

    Le helper vit ici et non dans `config_flow.py`, qui n'est pas importable
    sous les mocks de `tests/conftest.py` — il dérive de `ConfigFlow`. Un
    helper qui y resterait ne serait couvert que par analyse de source, ce qui
    avait déjà donné un test vert sur une garde inversée dans le dépôt d'origine.
    """
    changed = hass.config_entries.async_update_entry(entry, **updates)
    if not changed or not entry.update_listeners:
        hass.config_entries.async_schedule_reload(entry.entry_id)


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Recharge l'entrée après toute modification.

    Ce listener est le SEUL endroit qui recharge, et c'est ce que Home
    Assistant attend d'une intégration qui en enregistre un.

    **Ne pas le conditionner aux options** pour éviter un double rechargement :
    ça rendrait une reconfiguration sans effet, puisqu'elle ne touche que les
    données. **Ne pas passer à `OptionsFlowWithReload`** non plus, malgré son
    nom engageant : sa propre docstring interdit de l'employer quand
    l'intégration enregistre un listener de mise à jour.
    """
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: EscaladeConfigEntry) -> bool:
    """Décharge une entrée.

    Rien à nettoyer : Home Assistant supprime `runtime_data` lui-même quand le
    déchargement réussit.
    """
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: EscaladeConfigEntry) -> None:
    """Retire le service quand la dernière entrée est supprimée.

    Au retrait de l'entrée et non à son déchargement : un rechargement passe
    par unload puis setup, et retirer le service entre les deux laisserait une
    fenêtre — le temps du setup de la plateforme, entrées/sorties disque
    comprises — pendant laquelle une automatisation reçoit `ServiceNotFound`.
    Les rechargements sont fréquents : changement d'options, reconfiguration.
    """
    # Pas d'exclusion de l'entrée en cours de suppression : Home Assistant la
    # décharge avant d'appeler ce handler, donc son état n'est plus LOADED et
    # le filtre d'état de _calendar_entries l'écarte déjà. Se fier à sa présence
    # dans la collection serait de toute façon fragile : HA a inversé l'ordre
    # en 2025.3.
    if _calendar_entries(hass):
        return
    if hass.services.has_service(DOMAIN, SERVICE_REFRESH):
        hass.services.async_remove(DOMAIN, SERVICE_REFRESH)
