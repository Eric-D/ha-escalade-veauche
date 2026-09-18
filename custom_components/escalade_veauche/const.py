"""Constantes de l'intégration Escalade Veauche (Les Cimes Veauchoises)."""

DOMAIN = "escalade_veauche"

CONF_SCAN_INTERVAL = "scan_interval"
CONF_NOTIFY_WITHIN_DAYS = "notify_within_days"

# Une heure. Le club met à jour son calendrier à la main, souvent la veille du
# créneau : plus court ne rendrait pas l'information plus fraîche et ne ferait
# que marteler un site associatif. Le plancher du flux est à 15 minutes pour la
# même raison — la médiathèque descendait à 5, mais elle sert un compte
# personnel, pas une page publique commune à tous les adhérents.
DEFAULT_SCAN_INTERVAL = 60  # minutes
MIN_SCAN_INTERVAL = 15
MAX_SCAN_INTERVAL = 1440

# Horizon de notification : au-delà, le club a encore tout le temps de changer
# d'avis, et prévenir à chaque fois apprend à ignorer les notifications. Une
# semaine couvre le cas réel — l'encadrant qui se désiste quelques jours avant.
# 0 désactive l'événement.
DEFAULT_NOTIFY_WITHIN_DAYS = 7
MAX_NOTIFY_WITHIN_DAYS = 30

BASE_URL = "https://www.cimesveauchoises.fr"
CALENDAR_URL = f"{BASE_URL}/calendrier.php"
SCHEDULE_URL = f"{BASE_URL}/horaires.php"

# Jours de la semaine dans l'ordre de datetime.weekday() : l'index est la clé
# d'échange entre le scraper, les capteurs et la carte. Le libellé français
# n'est là que pour l'affichage — ne jamais s'en servir comme identifiant, il
# porte des accents et une casse que le site peut changer.
WEEKDAYS_FR = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
]
