"""Ce que le finder de `conftest.py` fabrique doit rester visible.

Le finder fait réussir **n'importe quel** import sous `homeassistant.` ou
`voluptuous`, y compris une faute de frappe ou un helper retiré de l'amont.
Sans trace, la CI resterait verte pendant que l'intégration ne se charge plus
chez l'utilisateur. Cette suite compare l'ensemble effectivement fabriqué à une
liste attendue : un nouvel import devient visible sans bloquer la suite.

Le job `import-check` de la CI installe, lui, le vrai paquet — c'est le seul
endroit où l'existence des modules est réellement vérifiée.
"""
from __future__ import annotations

import importlib

# Importés pour leur effet de bord : c'est l'import qui peuple MOCKED_MODULES.
import custom_components.escalade_veauche
import custom_components.escalade_veauche.changes
import custom_components.escalade_veauche.coordinator
import custom_components.escalade_veauche.dates
import custom_components.escalade_veauche.scraper  # noqa: F401

# Les modules Home Assistant dont dépendent les fichiers importables sous les
# mocks. `sensor.py` et `config_flow.py` n'en font pas partie : ils ne sont pas
# importables ici, cf. leurs docstrings.
EXPECTED_ROOTS = {
    "homeassistant",
    "homeassistant.components",
    "homeassistant.components.frontend",
    "homeassistant.components.http",
    "homeassistant.config_entries",
    "homeassistant.const",
    "homeassistant.core",
    "homeassistant.exceptions",
    "homeassistant.helpers",
    "homeassistant.helpers.config_validation",
    "homeassistant.helpers.start",
    "homeassistant.helpers.storage",
    "homeassistant.helpers.update_coordinator",
    "homeassistant.util",
    "homeassistant.util.dt",
}


class TestMockedModules:
    def test_no_unexpected_module_is_fabricated(self, mocked_ha_modules, mocked_roots):
        """Un import inattendu signale soit une dépendance nouvelle à
        documenter, soit une faute de frappe que le finder vient d'avaler."""
        if not mocked_roots:
            return  # les vrais paquets sont installés : rien n'est fabriqué
        unexpected = {
            name for name in mocked_ha_modules if name.startswith("homeassistant")
        } - EXPECTED_ROOTS
        assert not unexpected, (
            f"modules Home Assistant inattendus : {sorted(unexpected)}. "
            "Ajoutez-les à EXPECTED_ROOTS si c'est voulu."
        )


class TestTestableModulesStayImportable:
    """La propriété qui donne sa valeur à toute la suite.

    Le jour où l'un de ces modules importe `SensorEntity` ou dérive de
    `ConfigFlow`, il cesse d'être importable sous les mocks — et **tous** ses
    tests disparaissent de la collecte sans qu'aucun ne devienne rouge.
    """

    def test_every_logic_module_imports_under_the_mocks(self):
        for name in ("changes", "coordinator", "dates", "scraper"):
            module = importlib.import_module(f"custom_components.escalade_veauche.{name}")
            assert module is not None, name
