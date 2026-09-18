"""Obtention des données, et ce que voit l'adhérent quand le site est en panne.

Ce module est sous test précisément parce qu'il a été sorti de `sensor.py`,
non importable sous les mocks : le repli sur cache et le marquage de fraîcheur
n'y auraient été couverts que par relecture.
"""
from __future__ import annotations

from datetime import date
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.escalade_veauche.coordinator import (
    EscaladeDataSource,
    async_load_cache,
    build_unique_id,
    is_valid_payload,
)

RAW = {
    "creneaux": [
        {
            "date": "2026-09-22",
            "date_display": "22/09/2026",
            "weekday": 1,
            "jour": "Mardi",
            "statut": "Ouvert",
            "open": True,
        }
    ],
    "horaires": {"1": "19h00-21h30"},
}


def _source(client=None, cached=None, state=None, notify_within_days=0):
    hass = MagicMock()

    async def run(func, *args):
        return func(*args)

    hass.async_add_executor_job = AsyncMock(side_effect=run)
    store = MagicMock()
    store.async_save = AsyncMock()
    source = EscaladeDataSource(
        hass,
        client or MagicMock(fetch_all=MagicMock(return_value=RAW)),
        store,
        cached if cached is not None else {},
        state if state is not None else {"last_success": None},
        notify_within_days,
    )
    # Fixe : sinon le test dépend du jour où il tourne, et « prochain créneau »
    # finirait par se vider tout seul en 2027.
    source._today = lambda: date(2026, 9, 17)
    return source


class TestBuildUniqueId:
    def test_derives_from_the_entry_id(self):
        """Jamais d'une option ni d'une donnée du site : un identifiant qui en
        dépend crée des entités neuves dès qu'elle change, et orpheline
        l'historique."""
        assert build_unique_id("abc123", "next_open") == "abc123_next_open"

    def test_two_entries_never_collide(self):
        assert build_unique_id("a", "x") != build_unique_id("b", "x")


class TestIsValidPayload:
    def test_accepts_the_scraper_output(self):
        assert is_valid_payload(RAW)

    def test_accepts_an_unknown_status(self):
        """`open: None` est une valeur légitime — ni le libellé ni la couleur
        n'ont été compris — pas un cache corrompu."""
        assert is_valid_payload({"creneaux": [{"date": "2026-09-22", "open": None}]})

    def test_rejects_a_foreign_shape(self):
        """Le Store versionne le conteneur, pas le contenu : un cache écrit par
        une version antérieure ferait lever les capteurs à chaque écriture
        d'état."""
        assert not is_valid_payload("pas un dict")
        assert not is_valid_payload({"creneaux": "pas une liste"})
        assert not is_valid_payload({"creneaux": [{"date": 20260922}]})
        assert not is_valid_payload({"creneaux": [{"date": "2026-09-22", "open": "oui"}]})


class TestAsyncLoadCache:
    @pytest.mark.asyncio
    async def test_returns_what_was_written(self):
        store = MagicMock()
        store.async_load = AsyncMock(return_value={"data": RAW, "last_success": "hier"})
        assert (await async_load_cache(store))["data"] == RAW

    @pytest.mark.asyncio
    async def test_drops_an_unreadable_payload_but_keeps_the_container(self):
        store = MagicMock()
        store.async_load = AsyncMock(
            return_value={"data": {"creneaux": "cassé"}, "last_success": "hier"}
        )
        cached = await async_load_cache(store)
        assert "data" not in cached
        assert "last_success" not in cached

    @pytest.mark.asyncio
    async def test_a_corrupt_container_is_ignored(self):
        store = MagicMock()
        store.async_load = AsyncMock(return_value=["pas un dict"])
        assert await async_load_cache(store) == {}


class TestAsyncUpdate:
    @pytest.mark.asyncio
    async def test_serves_derived_data_on_success(self):
        data = await _source().async_update()
        assert data["fetch_ok"] is True
        assert data["creneaux"][0]["days_left"] == 5
        assert data["next_open"]["date"] == "2026-09-22"

    @pytest.mark.asyncio
    async def test_the_disk_cache_keeps_the_raw_output(self):
        """Y écrire une valeur dérivée la figerait à la date du relevé : une
        journée d'indisponibilité du site servirait « dans 3 jours » pour un
        créneau déjà passé."""
        source = _source()
        await source.async_update()
        source.store.async_save.assert_awaited_once()
        saved = source.store.async_save.await_args.args[0]
        assert "days_left" not in saved["data"]["creneaux"][0]

    @pytest.mark.asyncio
    async def test_falls_back_to_the_cache_and_says_so(self):
        client = MagicMock(fetch_all=MagicMock(side_effect=RuntimeError("503")))
        source = _source(client, cached={"data": RAW}, state={"last_success": "hier"})
        data = await source.async_update()
        assert data["fetch_ok"] is False
        assert data["last_success"] == "hier"
        # Sans horodatage d'échec, deux cycles consécutifs produiraient un
        # payload identique, HA dédoublonnerait l'écriture d'état, et la carte
        # n'afficherait jamais son bandeau de péremption.
        assert data["last_error_at"]

    @pytest.mark.asyncio
    async def test_the_fallback_recomputes_the_delays(self):
        """C'est le seul chemin où les données traversent un minuit sans
        nouveau relevé."""
        client = MagicMock(fetch_all=MagicMock(side_effect=RuntimeError("503")))
        source = _source(client, cached={"data": RAW}, state={"last_success": "hier"})
        source._today = lambda: date(2026, 9, 21)
        data = await source.async_update()
        assert data["creneaux"][0]["days_left"] == 1

    @pytest.mark.asyncio
    async def test_the_fallback_does_not_rewrite_the_cache(self):
        client = MagicMock(fetch_all=MagicMock(side_effect=RuntimeError("503")))
        source = _source(client, cached={"data": RAW}, state={"last_success": "hier"})
        await source.async_update()
        source.store.async_save.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_raises_when_there_is_nothing_to_fall_back_on(self):
        from homeassistant.helpers.update_coordinator import UpdateFailed

        client = MagicMock(fetch_all=MagicMock(side_effect=RuntimeError("503")))
        with pytest.raises(UpdateFailed):
            await _source(client).async_update()

    @pytest.mark.asyncio
    async def test_never_asks_the_user_to_reauthenticate(self):
        """La page est publique : tout échec est transitoire et rien n'est à
        ressaisir. Lever ConfigEntryAuthFailed afficherait une notification
        « Reconfigurer » devant laquelle l'adhérent n'aurait rien à faire."""
        from homeassistant.exceptions import ConfigEntryAuthFailed
        from homeassistant.helpers.update_coordinator import UpdateFailed

        client = MagicMock(fetch_all=MagicMock(side_effect=PermissionError("403")))
        with pytest.raises((UpdateFailed, ConfigEntryAuthFailed)) as excinfo:
            await _source(client).async_update()
        assert not isinstance(excinfo.value, ConfigEntryAuthFailed)


class TestChangeEvents:
    """Le seul chemin de ce dépôt qui déclenche une action chez l'utilisateur.

    Les règles de détection sont couvertes par `test_changes.py` ; ici on
    vérifie le câblage, qui est ce qu'une refactorisation casse sans que rien
    ne le dise — un événement jamais émis ne produit aucune erreur.
    """

    @pytest.mark.asyncio
    async def test_fires_an_event_when_a_slot_switches(self):
        from custom_components.escalade_veauche.changes import EVENT_SLOT_CHANGED

        closed = {**RAW, "creneaux": [{**RAW["creneaux"][0], "open": False}]}
        source = _source(
            MagicMock(fetch_all=MagicMock(return_value=closed)),
            cached={"data": RAW},
            notify_within_days=7,
        )
        await source.async_update()
        source.hass.bus.async_fire.assert_called_once()
        event, payload = source.hass.bus.async_fire.call_args.args
        assert event == EVENT_SLOT_CHANGED
        assert payload["now"] == "ferme"

    @pytest.mark.asyncio
    async def test_the_first_reading_of_a_fresh_install_is_silent(self):
        """Cache absent : vingt notifications d'un coup seraient les dernières
        que l'utilisateur lirait."""
        source = _source(notify_within_days=7)
        await source.async_update()
        source.hass.bus.async_fire.assert_not_called()

    @pytest.mark.asyncio
    async def test_a_change_during_a_shutdown_is_still_announced(self):
        """L'historique est amorcé sur le cache, pas sur None : la bascule de
        la veille au soir est le cas le plus utile, et Home Assistant peut
        très bien avoir été arrêté entre-temps."""
        closed = {**RAW, "creneaux": [{**RAW["creneaux"][0], "open": False}]}
        source = _source(
            MagicMock(fetch_all=MagicMock(return_value=closed)),
            cached={"data": RAW},
            notify_within_days=7,
        )
        await source.async_update()
        assert source.hass.bus.async_fire.called

    @pytest.mark.asyncio
    async def test_a_cache_fallback_announces_nothing(self):
        """Les créneaux servis sont ceux du dernier relevé réussi : rien n'a
        changé, et prévenir d'une bascule qui n'a pas eu lieu est pire que se
        taire."""
        client = MagicMock(fetch_all=MagicMock(side_effect=RuntimeError("503")))
        source = _source(client, cached={"data": RAW}, state={"last_success": "hier"},
                         notify_within_days=7)
        await source.async_update()
        source.hass.bus.async_fire.assert_not_called()

    @pytest.mark.asyncio
    async def test_the_same_change_is_not_replayed_next_cycle(self):
        """Le journal est tenu à chaque relevé, qu'un écouteur lève ou non :
        sinon la même notification repart toutes les heures."""
        closed = {**RAW, "creneaux": [{**RAW["creneaux"][0], "open": False}]}
        source = _source(
            MagicMock(fetch_all=MagicMock(return_value=closed)),
            cached={"data": RAW},
            notify_within_days=7,
        )
        await source.async_update()
        source.hass.bus.async_fire.reset_mock()
        await source.async_update()
        source.hass.bus.async_fire.assert_not_called()

    @pytest.mark.asyncio
    async def test_zero_disables_the_events_entirely(self):
        closed = {**RAW, "creneaux": [{**RAW["creneaux"][0], "open": False}]}
        source = _source(
            MagicMock(fetch_all=MagicMock(return_value=closed)),
            cached={"data": RAW},
            notify_within_days=0,
        )
        await source.async_update()
        source.hass.bus.async_fire.assert_not_called()
