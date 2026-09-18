"""Croisement du flux de configuration et des fichiers de traduction.

`strings.json` n'est **jamais lu à l'exécution** pour une intégration
personnalisée : Home Assistant ne charge que `translations/<langue>.json`, avec
repli sur `en`. Une clé présente dans le seul `strings.json` s'affiche donc en
clé brute à l'utilisateur. Cette suite croise donc **tous** les fichiers, et il
ne faut pas la restreindre à `strings.json`.

`en.json` n'est pas optionnel : `en` est la langue de repli de Home Assistant,
donc ce que voit tout utilisateur non francophone.
"""
from __future__ import annotations

import json
import pathlib

import pytest

ROOT = pathlib.Path(__file__).resolve().parent.parent
COMPONENT = ROOT / "custom_components/escalade_veauche"

FILES = {
    "strings.json": COMPONENT / "strings.json",
    "fr.json": COMPONENT / "translations/fr.json",
    "en.json": COMPONENT / "translations/en.json",
}


def _load(name: str) -> dict:
    return json.loads(FILES[name].read_text("utf-8"))


def _flatten(data: dict, prefix: str = "") -> set[str]:
    keys: set[str] = set()
    for key, value in data.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys |= _flatten(value, path)
        else:
            keys.add(path)
    return keys


@pytest.mark.parametrize("name", list(FILES))
class TestEveryFileIsComplete:
    def test_exists(self, name):
        assert FILES[name].is_file(), f"{name} manquant"

    def test_declares_every_step_of_the_flow(self, name):
        """Une étape sans traduction s'affiche en clé brute, et le formulaire
        devient illisible."""
        steps = _load(name)["config"]["step"]
        assert set(steps) == {"user", "reconfigure"}

    def test_declares_every_field_of_every_step(self, name):
        """Les deux réglages sont les seuls que l'utilisateur voie : un champ
        sans libellé s'affiche « notify_within_days »."""
        steps = _load(name)["config"]["step"]
        for step, content in steps.items():
            assert set(content["data"]) == {"scan_interval", "notify_within_days"}, step

    def test_declares_the_options_flow(self, name):
        options = _load(name)["options"]["step"]["init"]["data"]
        assert set(options) == {"scan_interval", "notify_within_days"}

    def test_declares_the_abort_reasons_the_flow_produces(self, name):
        """Ces raisons sont produites par nos propres `async_abort` et se
        résolvent donc dans notre domaine. On pourrait croire que
        `async_update_reload_and_abort` les ferait résoudre par le cœur en
        passant `translation_domain` : `FlowHandler.async_abort` n'accepte
        toujours pas ce paramètre, vérifié jusqu'en 2026.1."""
        aborts = _load(name)["config"]["abort"]
        assert {"already_configured", "reconfigure_successful"} <= set(aborts)

    def test_declares_the_error_the_flow_can_return(self, name):
        assert "cannot_connect" in _load(name)["config"]["error"]

    def test_declares_no_reauth_step(self, name):
        """La page est publique : une étape de ré-authentification traduite
        serait le premier symptôme d'un copier-coller depuis le dépôt
        d'origine."""
        assert "reauth_confirm" not in _load(name)["config"]["step"]


class TestFilesAgreeWithEachOther:
    def test_fr_and_strings_have_the_same_keys(self):
        """`strings.json` n'est lu que par les outils ; `fr.json` est ce que
        voit l'utilisateur. Les laisser diverger, c'est traduire dans le vide."""
        assert _flatten(_load("strings.json")) == _flatten(_load("fr.json"))

    def test_en_has_the_same_keys_as_fr(self):
        """`en` est la langue de repli : une clé absente s'y affiche en brut
        pour tout utilisateur non francophone."""
        assert _flatten(_load("en.json")) == _flatten(_load("fr.json"))

    def test_en_is_actually_translated(self):
        """Recopier `fr.json` sous le nom `en.json` fait passer les tests de
        clés et ne traduit rien."""
        assert _load("en.json")["config"]["step"]["user"]["title"] != (
            _load("fr.json")["config"]["step"]["user"]["title"]
        )


class TestServicesAreDescribed:
    def test_services_yaml_lists_the_registered_service(self):
        """Un service absent de services.yaml n'apparaît pas dans les outils
        de développement : l'utilisateur ne peut pas l'essayer avant de
        l'écrire dans une automatisation."""
        import yaml

        from custom_components.escalade_veauche import SERVICE_REFRESH

        services = yaml.safe_load((COMPONENT / "services.yaml").read_text("utf-8"))
        assert set(services) == {SERVICE_REFRESH}
