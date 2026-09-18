"""Câblage de l'intégration : service, sélection des entrées, rechargement.

Ces fonctions vivent au niveau module et non dans des closures de
`async_setup_entry` : c'est le seul moyen de les tester. Ce qui entre dans une
closure devient invisible à cette suite sans que rien ne le signale.
"""
from __future__ import annotations

import pathlib
import re
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from custom_components.escalade_veauche import (
    _async_refresh,
    _calendar_entries,
    update_entry_and_ensure_reload,
)

ROOT = pathlib.Path(__file__).resolve().parent.parent


def _entry(entry_id: str, state=ConfigEntryState.LOADED, runtime=...):
    entry = MagicMock()
    entry.entry_id = entry_id
    entry.state = state
    if runtime is ...:
        runtime = MagicMock(coordinator=MagicMock(async_refresh=AsyncMock()))
    if runtime is None:
        # `del` et non `= None` : `getattr(entry, "runtime_data", None)` sur un
        # MagicMock renvoie un mock, donc un attribut simplement mis à None ne
        # simulerait pas l'absence qu'on veut tester.
        del entry.runtime_data
    else:
        entry.runtime_data = runtime
    return entry


def _hass(*entries):
    hass = MagicMock()
    hass.config_entries.async_entries = MagicMock(return_value=list(entries))
    return hass


class TestCalendarEntries:
    def test_keeps_a_loaded_entry(self):
        entry = _entry("a")
        assert _calendar_entries(_hass(entry)) == [("a", entry.runtime_data)]

    def test_drops_an_entry_without_runtime_data(self):
        """Home Assistant le supprime au déchargement réussi : ce filtre écarte
        les entrées désactivées, ignorées et déchargées sans rien entretenir à
        la main."""
        assert _calendar_entries(_hass(_entry("a", runtime=None))) == []

    def test_drops_an_entry_that_failed_its_setup(self):
        """`runtime_data` est posé en première instruction et survit à un setup
        qui échoue ensuite — HA ne le supprime que sur le chemin du
        déchargement. Sans le filtre d'état, une entrée en erreur retient le
        service `refresh` indéfiniment."""
        assert _calendar_entries(_hass(_entry("a", state=ConfigEntryState.SETUP_ERROR))) == []


class TestAsyncRefresh:
    @pytest.mark.asyncio
    async def test_refreshes_every_configured_entry(self):
        first, second = _entry("a"), _entry("b")
        await _async_refresh(_hass(first, second))
        first.runtime_data.coordinator.async_refresh.assert_awaited_once()
        second.runtime_data.coordinator.async_refresh.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_complains_when_nothing_is_configured(self):
        with pytest.raises(ServiceValidationError):
            await _async_refresh(_hass())

    @pytest.mark.asyncio
    async def test_skips_an_entry_whose_platform_is_not_up_yet(self):
        """Le coordinator est posé par la plateforme sensor. Lever ici
        empêcherait de rafraîchir les autres entrées."""
        await _async_refresh(_hass(_entry("a", runtime=MagicMock(coordinator=None))))

    @pytest.mark.asyncio
    async def test_one_failure_does_not_stop_the_others(self):
        broken = _entry("a")
        broken.runtime_data.coordinator.async_refresh = AsyncMock(side_effect=RuntimeError("503"))
        healthy = _entry("b")
        await _async_refresh(_hass(broken, healthy))
        healthy.runtime_data.coordinator.async_refresh.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_raises_when_every_entry_failed(self):
        """Un service qui rend la main en silence après n'avoir rien
        rafraîchi ferait croire à une automatisation qu'elle lit des données à
        jour."""
        broken = _entry("a")
        broken.runtime_data.coordinator.async_refresh = AsyncMock(side_effect=RuntimeError("503"))
        with pytest.raises(HomeAssistantError):
            await _async_refresh(_hass(broken))


class TestUpdateEntryAndEnsureReload:
    def test_lets_the_listener_reload_when_the_entry_changed(self):
        """Un rechargement de plus ici serait un double rechargement : le
        listener s'en charge déjà."""
        hass = MagicMock()
        hass.config_entries.async_update_entry = MagicMock(return_value=True)
        entry = MagicMock(update_listeners=[object()])
        update_entry_and_ensure_reload(hass, entry, data={"x": 1})
        hass.config_entries.async_schedule_reload.assert_not_called()

    def test_reloads_when_nothing_changed(self):
        """Reconfiguration rouverte puis resoumise à l'identique :
        async_update_entry renvoie False sans notifier personne, et l'entrée
        resterait en erreur alors que le site vient de répondre."""
        hass = MagicMock()
        hass.config_entries.async_update_entry = MagicMock(return_value=False)
        entry = MagicMock(entry_id="a", update_listeners=[object()])
        update_entry_and_ensure_reload(hass, entry, data={"x": 1})
        hass.config_entries.async_schedule_reload.assert_called_once_with("a")

    def test_reloads_when_no_listener_is_registered(self):
        """Entrée désactivée, ou setup interrompu avant add_update_listener."""
        hass = MagicMock()
        hass.config_entries.async_update_entry = MagicMock(return_value=True)
        entry = MagicMock(entry_id="a", update_listeners=[])
        update_entry_and_ensure_reload(hass, entry, data={"x": 1})
        hass.config_entries.async_schedule_reload.assert_called_once_with("a")


class TestRuntimeDataIsActuallyWired:
    """Rien à l'exécution ne fait respecter l'affectation de `runtime_data`.

    L'attribut n'a pas de défaut et son absence est silencieuse —
    `_calendar_entries` l'écarte par un `getattr`. Ne jamais le poser rendrait
    l'intégration entièrement muette avec la CI au vert : zéro capteur, et un
    `refresh` qui répond « aucun calendrier configuré ». D'où ces deux
    lectures de source, `sensor.py` n'étant pas importable sous les mocks.
    """

    def test_setup_entry_assigns_runtime_data(self):
        source = (ROOT / "custom_components/escalade_veauche/__init__.py").read_text("utf-8")
        assert re.search(r"entry\.runtime_data\s*=\s*EscaladeRuntimeData\(", source)

    def test_the_sensor_platform_hands_back_its_coordinator(self):
        """Sans cette ligne, le service `refresh` ne trouve jamais de
        coordinator et ne rafraîchit rien — en silence."""
        source = (ROOT / "custom_components/escalade_veauche/sensor.py").read_text("utf-8")
        assert re.search(r"entry\.runtime_data\.coordinator\s*=\s*coordinator", source)


class TestNoAuthenticationPath:
    """La page est publique. Un flux de ré-authentification ne pourrait
    qu'afficher à l'adhérent une demande devant laquelle il n'a rien à faire —
    et c'est le genre de code qu'on recopie sans y penser depuis le dépôt
    d'origine, qui en a un."""

    def test_no_module_raises_config_entry_auth_failed(self):
        # Sur le code, pas sur le texte : `coordinator.py` explique en
        # commentaire pourquoi il ne la lève pas, et un test qui interdirait la
        # chaîne interdirait d'abord d'écrire l'explication.
        for path in (ROOT / "custom_components/escalade_veauche").glob("*.py"):
            source = path.read_text("utf-8")
            assert "raise ConfigEntryAuthFailed" not in source, path.name
            assert "import ConfigEntryAuthFailed" not in source, path.name

    def test_the_config_flow_has_no_reauth_step(self):
        source = (ROOT / "custom_components/escalade_veauche/config_flow.py").read_text("utf-8")
        assert "async_step_reauth" not in source
