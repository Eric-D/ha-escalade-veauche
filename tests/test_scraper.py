"""Analyse de la page du calendrier.

La fixture `calendrier.html` est une capture réelle de la page publique. C'est
elle qui donne sa valeur à cette suite : un gabarit reconstitué à la main ne
prouverait que la cohérence du test avec lui-même, alors que le seul risque de
ce module est que le site change.
"""
from __future__ import annotations

import pathlib

import pytest

from custom_components.escalade_veauche.scraper import (
    CalendarUnavailableError,
    parse_calendar,
    parse_schedule,
    parse_status,
)

FIXTURE = (pathlib.Path(__file__).parent / "fixtures/calendrier.html").read_text("utf-8")


class TestParseStatus:
    def test_reads_the_two_words_of_the_site(self):
        assert parse_status("Ouvert.") is True
        assert parse_status("Fermé.") is False

    def test_ignores_case_and_accents(self):
        """« Ferme » sans accent a déjà été publié, et la casse varie."""
        assert parse_status("ferme") is False
        assert parse_status("FERMÉ") is False
        assert parse_status("OUVERT") is True

    def test_unknown_wording_stays_unknown(self):
        """Surtout pas False par défaut : annoncer « fermé » sur un libellé
        qu'on n'a pas su lire envoie l'adhérent grimper ailleurs un soir
        d'ouverture."""
        assert parse_status("Annulé") is None
        assert parse_status("") is None


class TestParseCalendar:
    def test_reads_every_slot_of_the_page(self):
        slots = parse_calendar(FIXTURE)
        assert len(slots) == 20

    def test_first_slot_is_fully_decoded(self):
        first = parse_calendar(FIXTURE)[0]
        assert first["date"] == "2026-09-15"
        assert first["date_display"] == "15/09/2026"
        assert first["jour"] == "Mardi"
        # 1 = mardi au sens de datetime.weekday(). C'est la clé d'échange avec
        # la carte, qui ne doit jamais la recalculer : Date.getDay() compte à
        # partir du dimanche.
        assert first["weekday"] == 1
        assert first["open"] is True

    def test_closed_days_are_read_as_closed(self):
        slots = {slot["date"]: slot["open"] for slot in parse_calendar(FIXTURE)}
        assert slots["2026-09-16"] is False
        assert slots["2026-09-17"] is True

    def test_weekday_matches_the_label_of_the_site(self):
        """Un décalage d'un rang entre le libellé et l'indice filtrerait les
        mauvais jours dans la carte, sans rien afficher d'anormal."""
        from custom_components.escalade_veauche.const import WEEKDAYS_FR

        for slot in parse_calendar(FIXTURE):
            assert WEEKDAYS_FR[slot["weekday"]] == slot["jour"]

    def test_slots_are_sorted_by_date(self):
        """Tout l'aval suppose cet ordre — « prochain créneau » le prend en
        tête de liste. La page est chronologique aujourd'hui, rien ne le
        garantit demain."""
        dates = [slot["date"] for slot in parse_calendar(FIXTURE)]
        assert dates == sorted(dates)

    def test_no_derived_field_is_produced(self):
        """Le scraper n'a pas accès à hass : `date.today()` y suivrait le fuseau
        du système hôte. Tout ce qui dépend du jour courant vit dans dates.py,
        et le cache disque garde cette sortie brute."""
        for slot in parse_calendar(FIXTURE):
            assert "days_left" not in slot
            assert "past" not in slot

    def test_colour_is_used_when_the_wording_is_unreadable(self):
        html = """
        <ul id="skill">
          <li><span class="bar progressrouge "></span><h3>Mardi 15/09/2026 Annulé.</h3></li>
        </ul>
        """
        slot = parse_calendar(html)[0]
        assert slot["open"] is False
        # Le libellé réel est conservé : c'est ce que l'adhérent lit sur la page.
        assert slot["statut"] == "Annulé"

    def test_wording_wins_over_a_contradicting_colour(self, caplog):
        """Le texte est ce que lit l'adhérent. La divergence est journalisée
        parce que c'est le symptôme d'un gabarit qui a bougé, et que rien
        d'autre ne le dirait."""
        html = """
        <ul id="skill">
          <li><span class="bar progressrouge "></span><h3>Mardi 15/09/2026 Ouvert.</h3></li>
        </ul>
        """
        slot = parse_calendar(html)[0]
        assert slot["open"] is True
        assert "contradictoire" in caplog.text

    def test_unreadable_slot_is_skipped_not_fatal(self):
        """Une ligne éditoriale glissée dans la liste ne doit pas priver
        l'utilisateur de tout son calendrier."""
        html = """
        <ul id="skill">
          <li><h3>Reprise après les vacances</h3></li>
          <li><span class="bar progressgreen "></span><h3>Mardi 15/09/2026 Ouvert.</h3></li>
        </ul>
        """
        assert len(parse_calendar(html)) == 1

    def test_duplicate_dates_are_kept_once(self):
        """Le site a déjà publié deux fois la même date à un changement de
        saison ; un doublon dans la carte ressemble à un bug d'affichage."""
        html = """
        <ul id="skill">
          <li><span class="bar progressgreen "></span><h3>Mardi 15/09/2026 Ouvert.</h3></li>
          <li><span class="bar progressrouge "></span><h3>Mardi 15/09/2026 Fermé.</h3></li>
        </ul>
        """
        slots = parse_calendar(html)
        assert len(slots) == 1
        # La première gagne : c'est celle du haut de page, la plus à jour.
        assert slots[0]["open"] is True

    def test_unreadable_date_is_skipped(self):
        html = """
        <ul id="skill">
          <li><span class="bar progressgreen "></span><h3>Mardi 32/13/2026 Ouvert.</h3></li>
          <li><span class="bar progressgreen "></span><h3>Jeudi 17/09/2026 Ouvert.</h3></li>
        </ul>
        """
        slots = parse_calendar(html)
        assert [slot["date"] for slot in slots] == ["2026-09-17"]

    def test_missing_list_raises(self):
        """Une page qui a changé de structure doit se voir : le coordinator
        retombe alors sur son cache, ce qui est le bon comportement, mais
        renvoyer une liste vide ferait afficher « club fermé » à tout le
        monde."""
        with pytest.raises(CalendarUnavailableError):
            parse_calendar("<html><body>maintenance</body></html>")

    def test_empty_list_raises(self):
        with pytest.raises(CalendarUnavailableError):
            parse_calendar('<ul id="skill"></ul>')


class TestParseSchedule:
    def test_reads_the_hours_of_the_header(self):
        schedule = parse_schedule(FIXTURE)
        # Clés en indices weekday() rendus en chaîne : un attribut d'entité doit
        # rester stable même si le site change sa typographie.
        assert schedule["1"] == "19h00-21h30"  # mardi
        assert schedule["2"] == "19h00-21h00"  # mercredi
        assert schedule["5"] == "10h-12h30"  # samedi

    def test_missing_header_is_tolerated(self):
        """Le chapeau est éditorial, il a déjà été remanié. Une carte sans
        horaires reste utile ; une carte qui ne s'affiche plus, non."""
        assert parse_schedule("<html><body></body></html>") == {}

    def test_a_day_quoted_twice_keeps_the_first_block(self):
        """Le chapeau cite parfois un jour deux fois — créneau adultes puis
        école d'escalade. C'est le premier qui décrit le calendrier."""
        html = """
        <h1 class="title">Mardi (19h00-21h30) ... Mardi (17h30-19h00) enfants</h1>
        """
        assert parse_schedule(html)["1"] == "19h00-21h30"
