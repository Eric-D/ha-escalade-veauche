"""Flux de configuration.

Aucun identifiant à saisir : la page du club est publique. Le flux ne recueille
donc qu'un intervalle de relevé, et il n'existe **pas** d'étape de
ré-authentification — rien ne peut être refusé, donc rien n'est à ressaisir.

Ce module n'est pas importable sous les mocks de `tests/conftest.py`, parce
qu'il dérive de `ConfigFlow`. Ne pas y mettre de logique : elle ne serait
couverte que par analyse de source. C'est pourquoi
`update_entry_and_ensure_reload` vit dans `__init__.py`.
"""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback

from . import update_entry_and_ensure_reload
from .const import (
    CONF_NOTIFY_WITHIN_DAYS,
    CONF_SCAN_INTERVAL,
    DEFAULT_NOTIFY_WITHIN_DAYS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_NOTIFY_WITHIN_DAYS,
    MAX_SCAN_INTERVAL,
    MIN_SCAN_INTERVAL,
)
from .scraper import CimesVeauchoisesClient

_LOGGER = logging.getLogger(__name__)

# Identifiant unique fixe : le calendrier est commun à tout le club, deux
# entrées ne pourraient que relever deux fois la même page.
SINGLE_INSTANCE_ID = "cimes_veauchoises"

INTERVAL_SELECTOR = vol.All(
    vol.Coerce(int), vol.Range(min=MIN_SCAN_INTERVAL, max=MAX_SCAN_INTERVAL)
)
# Plancher à 0, qui désactive : c'est la seule façon pour un adhérent de ne
# rien recevoir sans désinstaller l'intégration, et elle doit tenir dans le
# même champ plutôt que dans une case à cocher de plus.
NOTIFY_SELECTOR = vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_NOTIFY_WITHIN_DAYS))


def _schema(interval: int, notify: int) -> vol.Schema:
    return vol.Schema({
        vol.Optional(CONF_SCAN_INTERVAL, default=interval): INTERVAL_SELECTOR,
        vol.Optional(CONF_NOTIFY_WITHIN_DAYS, default=notify): NOTIFY_SELECTOR,
    })


class EscaladeVeaucheConfigFlow(ConfigFlow, domain=DOMAIN):
    """Flux de configuration d'Escalade Veauche."""

    VERSION = 1

    async def _async_validate(self) -> str | None:
        """Vérifie que le calendrier est lisible. Clé d'erreur, ou None.

        Une seule clé d'erreur possible, contrairement à la médiathèque qui
        distingue « identifiants refusés » d'un échec structurel : ici tout
        échec est de la même nature — le site est injoignable ou sa page a
        changé — et l'utilisateur n'a rien à corriger dans le formulaire.
        """
        client = CimesVeauchoisesClient()
        try:
            await self.hass.async_add_executor_job(client.fetch_all)
        except Exception:
            _LOGGER.exception("Calendrier illisible à la configuration")
            return "cannot_connect"
        return None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Première étape : l'intervalle, et un relevé d'essai."""
        # Avant toute requête : inutile de solliciter le site du club pour une
        # entrée qui sera refusée.
        await self.async_set_unique_id(SINGLE_INSTANCE_ID)
        self._abort_if_unique_id_configured()

        errors: dict[str, str] = {}
        if user_input is not None:
            error = await self._async_validate()
            if error:
                errors["base"] = error
            else:
                return self.async_create_entry(
                    title="Escalade Veauche", data=user_input
                )

        return self.async_show_form(
            step_id="user",
            data_schema=_schema(DEFAULT_SCAN_INTERVAL, DEFAULT_NOTIFY_WITHIN_DAYS),
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Modifie l'intervalle depuis la fiche de l'intégration."""
        # _get_reconfigure_entry lève UnknownEntry au lieu de renvoyer None,
        # qui produisait un AttributeError opaque plus bas.
        entry = self._get_reconfigure_entry()

        errors: dict[str, str] = {}
        if user_input is not None:
            error = await self._async_validate()
            if error:
                errors["base"] = error
            else:
                # Pas async_update_reload_and_abort : voir la docstring de
                # update_entry_and_ensure_reload. Une resoumission à
                # l'identique ne notifierait aucun listener, et l'entrée
                # resterait en erreur alors que le site vient de répondre.
                update_entry_and_ensure_reload(
                    self.hass, entry, data={**entry.data, **user_input}
                )
                return self.async_abort(reason="reconfigure_successful")

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_schema(
                entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                entry.data.get(CONF_NOTIFY_WITHIN_DAYS, DEFAULT_NOTIFY_WITHIN_DAYS),
            ),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Flux d'options.

        L'entrée reste dans la signature — c'est Home Assistant qui appelle —
        mais n'est plus transmise : le flux la retrouve par sa propriété.
        """
        return EscaladeVeaucheOptionsFlow()


class EscaladeVeaucheOptionsFlow(OptionsFlow):
    """Options d'Escalade Veauche.

    Pas d'`__init__` : la classe de base expose l'entrée via sa propriété
    `config_entry` depuis 2024.12. La stocker soi-même est ce que faisait
    `OptionsFlowWithConfigEntry`, que Home Assistant met en erreur pour ses
    propres intégrations.

    Pas non plus d'`OptionsFlowWithReload`, qui recharge l'entrée à la fin du
    flux : sa docstring interdit de l'utiliser quand l'intégration enregistre
    un listener de mise à jour, ce qui est notre cas — et ce listener doit
    rester le seul point de rechargement.
    """

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Gère les options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        def current(key: str, default: int) -> int:
            """Option d'abord, donnée ensuite, défaut en dernier.

            L'inverse ferait réafficher la valeur du formulaire initial à
            chaque ouverture des options, et l'utilisateur écraserait son
            propre réglage en validant sans rien toucher.
            """
            return self.config_entry.options.get(
                key, self.config_entry.data.get(key, default)
            )

        return self.async_show_form(
            step_id="init",
            data_schema=_schema(
                current(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                current(CONF_NOTIFY_WITHIN_DAYS, DEFAULT_NOTIFY_WITHIN_DAYS),
            ),
        )
