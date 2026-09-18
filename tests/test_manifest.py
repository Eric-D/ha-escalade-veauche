"""Gardes sur ce que hassfest ne valide pas.

hassfest (job « hassfest » de validate.yml) valide réellement le manifeste :
ordre des clés, vocabulaire d'integration_type, présence de « version » et la
règle « composant importé mais non déclaré ». Dupliquer ça ici avec des
assertions écrites à la main ne donnerait que des tautologies relisant le
fichier qu'on vient d'écrire.

Restent deux choses que hassfest ignore et qui ne se voient autrement qu'à
l'installation ou après publication : le plancher annoncé à HACS, et la
cohérence des numéros de version entre les fichiers que le workflow de release
met à jour par substitution.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = json.loads(
    (ROOT / "custom_components/escalade_veauche/manifest.json").read_text("utf-8")
)
HACS = json.loads((ROOT / "hacs.json").read_text("utf-8"))


class TestHacsMinimumVersion:
    """hacs.json ne bloque que l'installation via HACS, rien d'autre.

    C'est un cliquet, pas une preuve : il empêche d'abaisser le plancher par
    inadvertance, mais il ne peut pas détecter qu'une API nouvellement utilisée
    exige plus récent. Sur le dépôt d'origine, `getGridOptions` — qui n'existe
    qu'à partir du frontend 20241106.0 — était passé inaperçu de cette façon.
    """

    def test_is_parsable(self):
        assert re.match(r"^\d+\.\d+", HACS["homeassistant"]), (
            f"version illisible : {HACS['homeassistant']!r}"
        )

    def test_the_readme_announces_the_same_floor(self):
        """Le README est le seul endroit qu'un utilisateur lit avant
        d'installer, et rien d'autre ne croise les deux fichiers."""
        readme = (ROOT / "README.md").read_text("utf-8")
        major, minor = HACS["homeassistant"].split(".")[:2]
        assert f"**{major}.{minor}**" in readme, (
            f"README.md n'annonce pas le plancher {major}.{minor} de hacs.json"
        )

    def test_covers_the_apis_in_use(self):
        major, minor = (
            int(p) for p in re.match(r"^(\d+)\.(\d+)", HACS["homeassistant"]).groups()
        )
        assert (major, minor) >= (2026, 1), (
            f"plancher annoncé {HACS['homeassistant']} : trop bas. "
            "Politique de support : série 2026 uniquement. Les API employées "
            "exigent au minimum 2024.12 (OptionsFlow.config_entry), "
            "2024.11 (getGridOptions) et 2024.7 (async_register_static_paths)."
        )


class TestVersionsAreSynchronised:
    """Le workflow de release propage la version par substitution.

    Un sed qui ne matche plus échoue silencieusement et publie un paquet dont
    les versions divergent. Le cas le plus coûteux est CARD_VERSION, qui sert
    de cache-buster à la ressource Lovelace : désynchronisé, il fait resservir
    un module périmé derrière une URL fraîche.
    """

    def test_card_version_matches_manifest(self):
        from custom_components.escalade_veauche import CARD_VERSION

        assert MANIFEST["version"] == CARD_VERSION

    def test_frontend_constant_matches_manifest(self):
        source = (ROOT / "frontend/src/version.ts").read_text("utf-8")
        match = re.search(r"export const ESCALADE_CARD_VERSION = '([^']+)';", source)
        assert match, "constante de version introuvable dans version.ts"
        assert match.group(1) == MANIFEST["version"]

    def test_package_json_matches_manifest(self):
        package = json.loads((ROOT / "frontend/package.json").read_text("utf-8"))
        assert package["version"] == MANIFEST["version"]

    def test_package_lock_matches_manifest(self):
        """npm version l'écrit à deux endroits, et il est commité par la release."""
        lock = json.loads((ROOT / "frontend/package-lock.json").read_text("utf-8"))
        assert lock["version"] == MANIFEST["version"]
        assert lock["packages"][""]["version"] == MANIFEST["version"]

    def test_committed_bundle_embeds_manifest_version(self):
        """Si le rebuild saute ou passe avant la substitution, la bannière du
        bundle annonce l'ancienne version tandis que l'URL porte la nouvelle :
        un module périmé servi derrière un cache-buster frais, exactement le
        symptôme que CARD_VERSION existe pour éviter."""
        bundle = (
            ROOT / "custom_components/escalade_veauche/www/escalade-card.js"
        ).read_text("utf-8")
        assert f'"{MANIFEST["version"]}"' in bundle


class TestCardIsShipped:
    def test_the_bundle_is_committed(self):
        """Le paquet HACS ne contient que ce qui est dans le dépôt : un bundle
        absent donne une intégration qui se charge et une carte introuvable."""
        assert (ROOT / "custom_components/escalade_veauche/www/escalade-card.js").is_file()

    def test_the_static_url_matches_the_file_name(self):
        """Ces deux-là sont écrits à deux endroits éloignés. Les désaccorder
        produit un 404 sur la ressource Lovelace, donc une carte définitivement
        en erreur, et rien d'autre ne le verrait."""
        from custom_components.escalade_veauche import CARD_URL

        assert CARD_URL.endswith("/escalade-card.js")
