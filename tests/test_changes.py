"""Détection des bascules de créneau.

C'est le seul module de ce dépôt qui déclenche une action chez l'utilisateur.
Un faux positif lui envoie une notification pour rien, ce qui lui apprend à les
ignorer ; un faux négatif lui fait rater exactement l'information pour laquelle
il a installé l'intégration. Aucun des deux ne se voit sur un tableau de bord.
"""
from __future__ import annotations

from custom_components.escalade_veauche.changes import (
    CHANGE_ADDED,
    CHANGE_CLOSED,
    CHANGE_OPENED,
    diff_slots,
)


def _slot(day: str, is_open: bool | None, days_left: int, **extra) -> dict:
    return {
        "date": day,
        "date_display": "peu importe",
        "weekday": 1,
        "jour": "Mardi",
        "statut": "Ouvert" if is_open else "Fermé",
        "open": is_open,
        "days_left": days_left,
        **extra,
    }


class TestNoPreviousReading:
    def test_a_fresh_install_says_nothing(self):
        """Sans cette règle, une installation neuve envoie vingt notifications
        d'un coup — et c'est la dernière fois que l'utilisateur les lit."""
        assert diff_slots(None, [_slot("2026-09-22", True, 2)], 7) == []

    def test_an_empty_previous_reading_is_not_the_same_as_none(self):
        """Une liste vide est un vrai relevé : le club n'avait rien annoncé,
        et une date qui apparaît est une nouvelle."""
        changes = diff_slots([], [_slot("2026-09-22", True, 2)], 7)
        assert [c["change"] for c in changes] == [CHANGE_ADDED]


class TestHorizon:
    def test_zero_disables_everything(self):
        before = [_slot("2026-09-22", True, 2)]
        after = [_slot("2026-09-22", False, 2)]
        assert diff_slots(before, after, 0) == []

    def test_a_distant_slot_is_ignored(self):
        """Le club a encore tout le temps de changer d'avis : prévenir à chaque
        fois apprend à ignorer les notifications."""
        before = [_slot("2026-10-20", True, 30)]
        after = [_slot("2026-10-20", False, 30)]
        assert diff_slots(before, after, 7) == []

    def test_the_horizon_is_inclusive(self):
        """Un adhérent qui règle « 7 jours » attend d'être prévenu pour le
        créneau dans exactement une semaine."""
        before = [_slot("2026-09-24", True, 7)]
        after = [_slot("2026-09-24", False, 7)]
        assert len(diff_slots(before, after, 7)) == 1

    def test_tonight_is_in_every_horizon(self):
        before = [_slot("2026-09-17", True, 0)]
        after = [_slot("2026-09-17", False, 0)]
        assert len(diff_slots(before, after, 1)) == 1

    def test_a_past_slot_never_notifies(self):
        """Le club corrige parfois une date révolue. Personne n'a besoin de
        l'apprendre."""
        before = [_slot("2026-09-10", True, -7)]
        after = [_slot("2026-09-10", False, -7)]
        assert diff_slots(before, after, 7) == []

    def test_an_unreadable_delay_never_notifies(self):
        """`days_left` à None n'a pas d'horizon, et `None <= 7` lèverait."""
        before = [_slot("illisible", True, 0)]
        after = [dict(_slot("illisible", False, 0), days_left=None)]
        assert diff_slots(before, after, 7) == []


class TestDetection:
    def test_a_slot_that_closes_is_reported(self):
        before = [_slot("2026-09-22", True, 2)]
        after = [_slot("2026-09-22", False, 2)]
        change = diff_slots(before, after, 7)[0]
        assert change["change"] == CHANGE_CLOSED
        assert change["was"] == "ouvert"
        assert change["now"] == "ferme"
        assert change["date"] == "2026-09-22"

    def test_a_slot_that_reopens_is_reported(self):
        before = [_slot("2026-09-22", False, 2)]
        after = [_slot("2026-09-22", True, 2)]
        change = diff_slots(before, after, 7)[0]
        assert change["change"] == CHANGE_OPENED
        assert change["was"] == "ferme"
        assert change["now"] == "ouvert"

    def test_an_unchanged_slot_is_silent(self):
        before = [_slot("2026-09-22", True, 2)]
        after = [_slot("2026-09-22", True, 2)]
        assert diff_slots(before, after, 7) == []

    def test_a_new_date_is_an_addition_not_a_switch(self):
        """Une automatisation qui annonce « le créneau de mardi vient de
        fermer » ne doit pas se déclencher sur une date que le club vient
        simplement d'ajouter au calendrier."""
        change = diff_slots([], [_slot("2026-09-22", False, 2)], 7)[0]
        assert change["change"] == CHANGE_ADDED
        assert change["was"] is None

    def test_slots_are_matched_by_date_never_by_position(self):
        """Le club retire les créneaux passés en tête de liste : les index
        glissent d'un relevé à l'autre, et une comparaison positionnelle
        signalerait une bascule imaginaire chaque semaine."""
        before = [_slot("2026-09-15", True, 0), _slot("2026-09-22", False, 7)]
        after = [_slot("2026-09-22", False, 6)]
        assert diff_slots(before, after, 7) == []

    def test_a_status_becoming_unreadable_is_reported(self):
        """Un créneau dont le statut cesse d'être compris n'est pas un
        non-événement : la carte va l'afficher « statut inconnu », et
        l'adhérent doit pouvoir l'apprendre autrement qu'en la consultant."""
        before = [_slot("2026-09-22", True, 2)]
        after = [_slot("2026-09-22", None, 2)]
        change = diff_slots(before, after, 7)[0]
        assert change["now"] == "inconnu"
        # Ni ouvert ni fermé : c'est bien classé comme une fermeture au sens
        # « ce n'est plus annoncé ouvert », ce que l'automatisation peut
        # affiner sur `now`.
        assert change["change"] == CHANGE_CLOSED

    def test_every_change_carries_what_a_message_needs(self):
        before = [_slot("2026-09-22", True, 2)]
        after = [_slot("2026-09-22", False, 2, horaire="19h00-21h30")]
        change = diff_slots(before, after, 7)[0]
        for key in ("date", "date_display", "jour", "weekday", "horaire", "days_left", "statut"):
            assert key in change, key
        assert change["horaire"] == "19h00-21h30"

    def test_several_changes_are_all_reported(self):
        before = [_slot("2026-09-22", True, 2), _slot("2026-09-24", True, 4)]
        after = [_slot("2026-09-22", False, 2), _slot("2026-09-24", False, 4)]
        assert len(diff_slots(before, after, 7)) == 2

    def test_noise_in_the_payload_is_skipped_not_fatal(self):
        assert diff_slots(["bruit"], ["bruit", _slot("2026-09-22", True, 2)], 7)
