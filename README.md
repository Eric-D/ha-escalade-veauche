# Escalade Veauche — Les Cimes Veauchoises

<img src="logo.png" alt="Les Cimes Veauchoises" height="64">

Intégration Home Assistant qui lit le [calendrier public](https://www.cimesveauchoises.fr/calendrier.php)
des Cimes Veauchoises et expose les prochains créneaux d'ouverture du mur
d'escalade, avec une carte Lovelace pour les afficher.

**Aucun identifiant n'est nécessaire** : la page est publique.

## Ce que ça donne

- Six capteurs : prochain créneau ouvert, prochain fermé, nombre de créneaux
  ouverts et fermés à venir, état du jour, horodatage du dernier relevé.
- Une carte `escalade-card`, où l'on choisit **les jours de la semaine à
  afficher** et **les statuts à afficher** (ouverts, fermés, ou les deux).
- Un événement Home Assistant quand un créneau proche **change d'état** — le
  cas qui compte : l'encadrant qui se désiste la veille au soir.
- Un intervalle de relevé configurable.

## Installation

### Par HACS

1. HACS → Intégrations → menu ⋮ → *Dépôts personnalisés*
2. Ajouter `https://github.com/Eric-D/ha-escalade-veauche`, catégorie
   *Integration*
3. Installer, puis redémarrer Home Assistant
4. *Paramètres → Appareils et services → Ajouter une intégration →
   Escalade Veauche*

### À la main

Copier `custom_components/escalade_veauche/` dans le dossier
`custom_components/` de votre configuration, puis redémarrer.

Version minimale de Home Assistant : **2026.1**.

## La carte

La carte est déclarée automatiquement comme ressource Lovelace : il n'y a rien
à ajouter dans les ressources. Elle apparaît dans le sélecteur de cartes sous
« Escalade Veauche ».

Configuration par l'interface, ou en YAML :

```yaml
type: custom:escalade-card
entity: sensor.escalade_aujourd_hui
title: Prochains créneaux
# Jours affichés, au sens de Python : 0 = lundi … 6 = dimanche.
# Absent = tous les jours.
days: [1, 3, 5]
# Statuts affichés. Absent = tous.
statuses: [open]
# Nombre maximal de lignes. Absent = pas de limite.
max: 6
```

`entity` peut viser n'importe quel capteur de l'intégration qui porte
l'attribut `creneaux` : `sensor.escalade_aujourd_hui` les porte tous,
`sensor.creneaux_ouverts` et `sensor.creneaux_fermes` portent déjà leur moitié.
Filtrer depuis la carte reste plus souple — on peut avoir deux cartes qui lisent
le même capteur.

Le bouton ⟳ de l'en-tête appelle le service `escalade_veauche.refresh`.

### Mode tuiles

Pour un tableau de bord mural, où la hauteur est la ressource rare : trois
tuiles calendrier, ni titre ni compteur, ~106 px au lieu de ~270.

```yaml
type: custom:escalade-card
entity: sensor.escalade_aujourd_hui
mode: tiles
count: 3                      # 1 à 4 tuiles
show_time: false              # "10h – 12h30"
show_countdown: false         # "en cours" / "aujourd'hui" / "demain" / "dans N j"
show_status: false            # point coloré + "Ouvert" / "Fermé"
background: /local/escalade.jpg   # photo dans config/www/ ; absent = fond uni
overlay: 0.35                 # opacité du voile sombre sur la photo
accent_open: var(--success-color)   # couleur des créneaux ouverts
accent_closed: var(--error-color)   # couleur des créneaux fermés
tap_action:
  action: more-info
```

Les trois `show_*` sont à `false` par défaut : c'est la version la plus basse,
on active ensuite ce qu'on veut. Tout activer monte la card à ~146 px.

La séance du jour est mise en avant sur un fond teinté par **son statut** :
vert si le club ouvre, rouge s'il ferme. Une séance fermée reste par ailleurs
en retrait même quand les statuts sont masqués — sans quoi elle serait
indiscernable d'une séance ouverte.

Les deux couleurs se règlent à la souris dans l'éditeur, avec un sélecteur de
couleur. En YAML, préférez une variable de thème à un code hexadécimal : elle
suit le thème de l'utilisateur, là où `#4caf50` le fige.

| | Défaut | Jeton |
|---|---|---|
| `accent_open` | vert de succès | `var(--success-color)` |
| `accent_closed` | rouge d'erreur | `var(--error-color)` |

Non configurable : un créneau au statut non reconnu reste sur
`var(--primary-color)`. Lui donner une couleur choisie inviterait à le lire
comme une troisième catégorie de créneau, alors qu'il ne dit rien du club.

**Une séance disparaît dès que son horaire est passé**, pas à minuit : la card
se rafraîchit chaque minute, ce qui lui permet aussi d'afficher « en cours »
pendant la séance et de basculer au passage de minuit sans rechargement.

Les filtres `days` et `statuses` s'appliquent aussi en mode tuiles, avant le
découpage à `count`.

## Être prévenu d'un changement

L'intégration émet un événement `escalade_veauche_slot_changed` dès qu'un
créneau **situé dans la fenêtre configurée** change d'état. La fenêtre se règle
dans les options de l'intégration (7 jours par défaut, `0` désactive).

Elle n'envoie **pas** la notification elle-même : c'est à vous de choisir le
canal. Exemple d'automatisation :

```yaml
automation:
  - alias: Créneau escalade annulé
    triggers:
      - trigger: event
        event_type: escalade_veauche_slot_changed
    conditions:
      - condition: template
        value_template: "{{ trigger.event.data.change == 'closed' }}"
    actions:
      - action: notify.mobile_app_telephone
        data:
          title: Escalade
          message: >-
            {{ trigger.event.data.jour }} {{ trigger.event.data.date_display }}
            est passé à « {{ trigger.event.data.statut }} ».
```

Données de l'événement :

| Champ | Contenu |
| --- | --- |
| `change` | `opened`, `closed` ou `added` (date nouvellement annoncée) |
| `was` / `now` | `ouvert`, `ferme`, `inconnu` ; `was` vaut `null` pour `added` |
| `date` | date ISO (`2026-09-22`) |
| `date_display` | date telle qu'écrite par le club (`22/09/2026`) |
| `jour` | `Mardi`, `Mercredi`, … |
| `weekday` | 0 = lundi … 6 = dimanche |
| `horaire` | plage horaire du jour, si le club l'annonce |
| `days_left` | nombre de jours d'ici le créneau |
| `statut` | le mot exact lu sur la page |

Aucun événement n'est émis au premier relevé d'une installation neuve, ni
quand l'intégration sert son cache parce que le site est injoignable.

## Capteurs

| Entité | État | Attributs notables |
| --- | --- | --- |
| `sensor.prochain_creneau_ouvert` | date | `jour`, `horaire`, `days_left` |
| `sensor.prochain_creneau_ferme` | date | idem |
| `sensor.creneaux_ouverts` | nombre | `creneaux` (ouverts à venir) |
| `sensor.creneaux_fermes` | nombre | `creneaux` (fermés à venir) |
| `sensor.escalade_aujourd_hui` | `ouvert` / `ferme` / `inconnu` / `hors_creneau` | `creneaux` (tous à venir), `horaire` |
| `sensor.derniere_maj_escalade` | horodatage | — |

`inconnu` et `hors_creneau` sont deux choses différentes : le premier veut dire
que le club a annoncé quelque chose que nous n'avons pas su lire, le second
qu'il n'y a pas de créneau ce jour-là.

Tous les capteurs de créneaux exposent aussi `last_success` et `fetch_ok` :
c'est ce qui permet à la carte d'afficher un bandeau quand elle sert des
données périmées.

## Service

`escalade_veauche.refresh` — relève le calendrier immédiatement. Le service ne
rend la main qu'une fois le relevé terminé, donc une automatisation qui lit un
capteur juste après voit bien la valeur à jour.

## Développement

Voir [CLAUDE.md](CLAUDE.md) pour les invariants du projet — ce qui a l'air d'un
oubli et n'en est pas. Les commandes de vérification y sont listées, et
`tests/test_documentation.py` s'assure qu'elles ne divergent pas de la CI.

## Licence

MIT. Ce dépôt n'est pas un projet officiel des Cimes Veauchoises ; il se
contente de lire leur page publique.
