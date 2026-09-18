"""Dérivations à partir d'une date injectée.

Rien n'est simulé ici : la date du jour est un paramètre. C'est tout le
bénéfice d'avoir sorti ces calculs du scraper — un test qui patcherait
`date.today` masquerait précisément le défaut qu'on veut empêcher, puisqu'il
donnerait au code une date que la production tirerait, elle, du fuseau de
l'hôte.
"""
from __future__ import annotations

from datetime import date

from custom_components.escalade_veauche.dates import days_until, with_derived

TODAY = date(2026, 9, 17)


def _slot(day: str, is_open: bool | None = True, weekday: int = 1) -> dict:
    return {
        "date": day,
        "date_display": "peu importe",
        "weekday": weekday,
        "jour": "Mardi",
        "statut": "Ouvert" if is_open else "Fermé",
        "open": is_open,
    }


def _data(*slots, horaires=None) -> dict:
    return {"creneaux": list(slots), "horaires": horaires or {}}


class TestDaysUntil:
    def test_future(self):
        assert days_until("2026-09-22", TODAY) == 5

    def test_today_is_zero(self):
        assert days_until("2026-09-17", TODAY) == 0

    def test_past_is_negative(self):
        assert days_until("2026-09-14", TODAY) == -3

    def test_across_months(self):
        assert days_until("2026-10-17", TODAY) == 30

    def test_unreadable_date_is_none(self):
        """0 signifierait « ce soir » : une information fausse, mise en avant
        en tête de carte."""
        assert days_until("pas une date", TODAY) is None
        assert days_until("", TODAY) is None
        assert days_until(None, TODAY) is None

    def test_the_timezone_of_the_caller_decides(self):
        """Le défaut d'origine : à la même seconde, deux fuseaux, deux jours.

        Un conteneur en UTC à 23 h 30 le 16 est déjà le 17 à Paris. Le créneau
        du 17 est « ce soir » pour l'adhérent et « demain » pour le système
        hôte — c'est ce décalage que l'injection de la date supprime.
        """
        assert days_until("2026-09-17", date(2026, 9, 16)) == 1
        assert days_until("2026-09-17", date(2026, 9, 17)) == 0


class TestWithDerived:
    def test_adds_days_left_to_every_slot(self):
        data = with_derived(_data(_slot("2026-09-22")), TODAY)
        assert data["creneaux"][0]["days_left"] == 5

    def test_does_not_mutate_its_input(self):
        """Muter en place laisserait l'ancien State de Home Assistant
        référencer les mêmes dicts : aucun state_changed ne serait émis au
        passage de minuit, et la carte afficherait le délai de la veille
        jusqu'au cycle suivant — une heure plus tard par défaut, donc un
        créneau du jour annoncé « demain » jusqu'à 1 h du matin."""
        source = _data(_slot("2026-09-22"))
        original = source["creneaux"][0]
        result = with_derived(source, TODAY)
        assert "days_left" not in original
        assert result["creneaux"][0] is not original

    def test_past_slots_are_marked_and_excluded_from_upcoming(self):
        data = with_derived(_data(_slot("2026-09-14"), _slot("2026-09-22")), TODAY)
        assert data["creneaux"][0]["past"] is True
        assert [slot["date"] for slot in data["upcoming"]] == ["2026-09-22"]

    def test_today_is_not_past(self):
        """La frontière qui compte : le créneau de ce soir doit rester dans les
        prochains jusqu'à minuit."""
        data = with_derived(_data(_slot("2026-09-17")), TODAY)
        assert data["creneaux"][0]["past"] is False
        assert len(data["upcoming"]) == 1

    def test_an_unreadable_date_is_neither_past_nor_counted(self):
        """None ne vaut pas « passé » : le créneau reste visible, avec son
        délai inconnu, plutôt que d'être masqué comme révolu."""
        data = with_derived(_data(_slot("illisible")), TODAY)
        assert data["creneaux"][0]["past"] is False
        assert data["creneaux"][0]["days_left"] is None

    def test_next_open_skips_the_closed_ones(self):
        data = with_derived(
            _data(_slot("2026-09-18", False), _slot("2026-09-19", True)), TODAY
        )
        assert data["next_open"]["date"] == "2026-09-19"
        assert data["next_closed"]["date"] == "2026-09-18"

    def test_next_open_ignores_past_slots(self):
        """Un site en panne depuis deux jours resservirait sinon le créneau de
        l'avant-veille comme « prochain »."""
        data = with_derived(
            _data(_slot("2026-09-15", True), _slot("2026-09-24", True)), TODAY
        )
        assert data["next_open"]["date"] == "2026-09-24"

    def test_next_open_is_none_when_nothing_is_announced(self):
        assert with_derived(_data(), TODAY)["next_open"] is None

    def test_an_unknown_status_counts_neither_open_nor_closed(self):
        """`open is True` et non `== True` : le jour où une refonte y mettrait
        un entier, `1 == True` classerait un créneau inconnu comme ouvert."""
        data = with_derived(_data(_slot("2026-09-22", None)), TODAY)
        assert data["open_count"] == 0
        assert data["closed_count"] == 0
        assert data["upcoming_count"] == 1
        assert data["next_open"] is None

    def test_today_slot_is_the_day_itself_not_the_next_one(self):
        """« Aujourd'hui » doit rester vide quand le prochain créneau est dans
        trois jours, plutôt que d'annoncer l'état d'un autre jour."""
        assert with_derived(_data(_slot("2026-09-20")), TODAY)["today"] is None
        assert with_derived(_data(_slot("2026-09-17")), TODAY)["today"]["date"] == "2026-09-17"

    def test_hours_are_attached_by_weekday(self):
        data = with_derived(
            _data(_slot("2026-09-22", weekday=1), horaires={"1": "19h00-21h30"}), TODAY
        )
        assert data["creneaux"][0]["horaire"] == "19h00-21h30"

    def test_a_weekday_without_hours_gets_none(self):
        data = with_derived(_data(_slot("2026-09-20", weekday=6), horaires={"1": "19h"}), TODAY)
        assert data["creneaux"][0]["horaire"] is None

    def test_a_payload_without_slots_is_returned_untouched(self):
        """Un cache d'une version antérieure ne doit pas faire lever le
        coordinator à chaque cycle."""
        assert with_derived({"autre": 1}, TODAY) == {"autre": 1}

    def test_a_non_dict_slot_is_dropped_not_fatal(self):
        data = with_derived({"creneaux": ["bruit", _slot("2026-09-22")]}, TODAY)
        assert len(data["creneaux"]) == 1
