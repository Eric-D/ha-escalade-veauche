"""CLAUDE.md et la CI doivent décrire les mêmes vérifications.

Découvrir l'écart en poussant est exactement la friction que ce dépôt cherche à
supprimer ailleurs : un contributeur qui suit la documentation à la lettre doit
obtenir le même verdict que la CI.
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
CLAUDE = (ROOT / "CLAUDE.md").read_text("utf-8")
VALIDATE = (ROOT / ".github/workflows/validate.yml").read_text("utf-8")


class TestTheCommandsAreDocumented:
    def test_every_ci_check_appears_in_claude_md(self):
        """Une vérification que la CI exécute et que la documentation tait est
        une vérification qu'on découvre en échec après avoir poussé."""
        for command in ("pytest", "ruff check .", "npm run typecheck", "npm run lint",
                        "npm test", "npm run build"):
            assert command in CLAUDE, f"{command!r} absent de CLAUDE.md"

    def test_the_bundle_check_is_documented(self):
        """La ligne qu'on oublie le plus souvent : le bundle commité doit
        correspondre au build, et la CI échoue sinon."""
        assert "git diff --exit-code" in CLAUDE
        assert "escalade-card.js" in CLAUDE

    def test_the_manifest_requirements_step_is_documented(self):
        """Les dépendances runtime viennent du manifeste, pas de
        requirements_test.txt : sans cette étape, `pytest` échoue à l'import de
        bs4 et le contributeur croit à un problème d'environnement."""
        assert "scripts/manifest_requirements.py" in CLAUDE


class TestTheFloorIsConsistent:
    def test_the_python_version_matches_between_ci_and_doc(self):
        """Le plancher Python suit celui de Home Assistant. Le laisser diverger
        laisse passer une syntaxe qu'un utilisateur du plancher ne peut pas
        importer."""
        versions = set(re.findall(r'python-version: "(\d+\.\d+)"', VALIDATE))
        assert versions <= {"3.13", "3.14"}, versions
        for version in versions:
            assert version in CLAUDE, f"Python {version} absent de CLAUDE.md"


class TestTheInvariantsAreWrittenDown:
    def test_the_card_loading_rule_is_documented(self):
        """C'est le point qui a coûté le plus de temps sur le dépôt d'origine,
        et celui qu'une refactorisation de bonne foi défait en premier."""
        assert "add_extra_js_url" in CLAUDE
        assert "scoped-custom-element-registry" in CLAUDE

    def test_the_timezone_rule_is_documented(self):
        assert "dt_util.now()" in CLAUDE

    def test_the_testability_rule_is_documented(self):
        """Pourquoi la logique ne vit pas dans sensor.py : sans cette note,
        elle y retourne à la première occasion."""
        assert "métaclasse" in CLAUDE
