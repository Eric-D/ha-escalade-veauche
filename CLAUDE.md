# Notes pour les contributeurs (humains et agents)

Ce dépôt reprend le cycle de vie, l'architecture et l'outillage de
[ha-mediatheque-veauche](https://github.com/Eric-D/ha-mediatheque-veauche). Les
invariants repris ci-dessous y ont été payés cher ; ils sont réécrits ici avec
leur ancre dans **ce** code, parce qu'un renvoi vers un autre dépôt n'est pas
lu.

La différence structurante : **il n'y a pas d'authentification.** La page du
club est publique. Tout ce qui, là-bas, tournait autour des identifiants —
`login()`, `ConfigEntryAuthFailed`, flux de ré-authentification, migration
d'identifiants uniques dérivés du login — n'a pas lieu d'être ici, et
`tests/test_init.py::TestNoAuthenticationPath` empêche qu'il y revienne par
copier-coller.

## Comment la carte est chargée — ne pas revenir en arrière

**La carte est déclarée comme ressource Lovelace, et uniquement comme ça.**
`add_extra_js_url()` ne doit être appelé qu'en dernier recours, quand la
collection de ressources est indisponible (mode YAML).

### Pourquoi

Home Assistant charge `@webcomponents/scoped-custom-element-registry`. Ce
polyfill **remplace** `window.customElements` :

```js
Object.defineProperty(window, 'customElements', {
  value: new CustomElementRegistry(), configurable: true, writable: true });
...
get(tagName) { return this._definitionsByTag.get(tagName)?.elementClass; }
```

Son `get()` ne consulte que sa propre table. `nativeGet` est capturé au
démarrage mais **jamais interrogé**. Toute définition faite avant son
installation lui est donc invisible, définitivement.

`add_extra_js_url()` injecte le script dans le document : il peut être évalué
*avant* le polyfill. La définition atterrit alors dans le registre natif, HA
appelle `customElements.get()` → rien → « Custom element doesn't exist », et
son rattrapage par `whenDefined()` est mort-né pour la même raison.

Les ressources Lovelace sont chargées par le panneau (`ha-panel-lovelace`),
donc toujours **après** le polyfill. C'est exactement pourquoi les cartes
distribuées en ressource (auto-entities, card-mod, mushroom…) ne rencontrent
jamais ce problème.

### Symptôme caractéristique

Sur un chargement en échec, dans la console :

```
customElements.get('escalade-card')               → undefined
document.createElement('escalade-card').setConfig  → "function"
```

Les deux ne peuvent diverger que s'il existe deux registres.

### Contre-intuitif

C'est le chargement le **plus rapide** qui échoue : le polyfill s'installe aux
alentours de 110–130 ms, et arriver avant lui est précisément ce qui casse.

### Ce que dit la documentation

La page officielle sur les cartes personnalisées ne décrit **que** le mécanisme
des ressources de tableau de bord, et ne mentionne ni `add_extra_js_url` ni
`extra_module_url` :
https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/

## Invariants de la carte

### Écarts délibérés au contrat des cartes personnalisées

Ces trois-là ressemblent à des oublis. Ne pas les « corriger ».

- **`setConfig()` ne lève pas pour une entité absente ou vide**
  (`card.ts`, `setConfig`). La convention Home Assistant veut qu'elle lève ; ça
  rendait la carte irrécupérable depuis l'interface. `ha-form` émet
  `entity: undefined` quand on vide le champ ; l'éditeur la recoerce en `''`
  (`editor.ts`, `_valueChanged`) et `setConfig` tolère en second rempart. Les
  deux sont nécessaires : retirer l'un en croyant l'autre suffisant restaure la
  panne. Seule une configuration non-objet lève encore.
- **Pas de garde d'égalité dans le setter `hass`** (`card.ts`). Une telle garde
  n'est pas seulement inutile, elle est **nuisible** : un early-return
  sauterait `_syncEntityState()` et laisserait l'état vide au premier rendu.
  Elle serait de surcroît sans effet, `requestUpdate()` filtrant déjà par
  `notEqual`. Le filtrage des re-rendus vit dans `shouldUpdate()`, qui doit
  conserver un cas non évident : `_config` doit toujours passer, car il peut
  arriver dans le même lot qu'un `hass` dont les états n'ont pas bougé.
- **Pas de `performUpdate()` synchrone dans `connectedCallback`**. Il y en a eu
  un sur le dépôt d'origine, ajouté contre une cause inventée — « HA interprète
  un rendu vide comme une erreur de configuration », mécanisme qui n'existe
  pas. Il faisait rendre la carte de façon ré-entrante dans le commit Lit de
  Home Assistant, et son retrait a rendu les changements de page nettement plus
  rapides.

### Ce qui doit rester vrai

- **Aucune dépendance externe dans le bundle** (`frontend/package.json` : que
  des `devDependencies`). Pas de CDN, pas de police distante — la carte doit
  fonctionner en WebView Android. Ici elle ne fait **aucun** accès réseau, à la
  différence de la médiathèque qui charge les couvertures.
- **Jamais `unsafeHTML` ni `unsafeSVG` sur du contenu venant du capteur.** Il
  n'y en a aucun, et il ne doit pas y en avoir : tout ce qui vient de la page
  du club (`jour`, `statut`, `horaire`) est du texte écrit par un tiers.
- **`render()` retourne toujours un `<ha-card>` visible**, loader compris. Pas
  parce que Home Assistant inspecterait le shadow root — il ne le fait pas —
  mais parce qu'un rendu vide ne donne à l'utilisateur aucune information.
- **Le dernier rendu n'est conservé que tant qu'il reste des retries**, sur
  **les deux** chemins d'indisponibilité (`card.ts`, `_render` : branche
  `!states` et branche entité indisponible). Au-delà, message explicite :
  afficher indéfiniment un calendrier périmé sans aucun indice est le
  comportement qu'on cherche à éviter. Le budget vaut environ 100 s
  d'indisponibilité continue (`helpers/retry.ts` : dix essais, `2000 × n`
  plafonné à 15 000), remis à zéro à chaque reconnexion de l'élément.
- **`customElements.define` reste gardé** par `if (!customElements.get(...))`
  (fin de module de `card.ts`, deux fois, et de `editor.ts`) : sur WebView
  Android le script peut être ré-évalué au retour de veille.
- **`window.customCards.push`** (fin de module de `card.ts`) : nécessaire au
  sélecteur de cartes. Rien en CI ne détecterait sa suppression.
- **L'événement `escalade-card-update`** est émis après chaque rendu effectif
  (`card.ts`, `updated`). C'est un contrat public pour les plugins tiers —
  card-mod notamment — sans aucun consommateur dans ce dépôt.
- **Aucun timer lié à un élément ne survit à son détachement.**
  `disconnectedCallback` annule le retry, `connectedCallback` remet le quota à
  zéro. La portée est volontairement étroite : la fin de module installe sept
  `setTimeout` pour la réparation des cartes d'erreur orphelines, qui ne
  dépendent d'aucun élément — légitime, ils sont à usage unique et plafonnés à
  quatre secondes.

**Ne pas extraire le bloc d'enregistrement** de `card.ts` sans très bonne
raison : c'est le code le plus débogué du fichier, et aucun test frontend ne
rattraperait une erreur.

Les rendus purement présentatifs vivent dans `renders/` : ils ne touchent pas à
l'état de la carte et reçoivent leurs gestionnaires en paramètres. Leurs
signatures à plusieurs paramètres passent par un objet nommé
(`renderHeader({ title, badgeText, … })`). Deux chaînes adjacentes dans une
signature positionnelle s'inversent sans que le typage ni le linter ne disent
rien.

### Le mode tuiles recalcule le nombre de jours — et c'est voulu

`helpers/schedule.ts` **ignore `days_left`** et recompte à partir de la date
civile, avec l'horloge du navigateur. C'est une exception à la règle ci-dessous,
pas un oubli, et elle a une cause précise.

L'intégration ne relève le calendrier qu'une fois par heure. Entre minuit et le
relevé suivant, `days_left` est périmé d'un jour : la séance du soir même
s'annoncerait « demain » jusqu'à 1 h du matin. Le mode liste s'en accommode,
les tuiles non — la spécification exige qu'elles basculent à minuit sans
rechargement, et qu'elles affichent « en cours » à la minute. Les deux
imposent l'horloge locale.

La contrepartie, assumée : sur un appareil dont le fuseau diffère de celui de
Home Assistant, les tuiles comptent les jours dans le fuseau de l'appareil.
Pour la tablette murale visée, c'est le comportement recherché.

**Ne pas « corriger » cette exception en rebranchant `days_left`** : le test
`bascule à minuit sans nouvelle donnée` (`test/schedule.test.ts`) tombe, et le
critère d'acceptation de la spécification avec lui.

Le filtrage, lui, porte sur la **fin** de la séance et non sur le jour : une
séance de 10 h à 12 h 30 disparaît à 12 h 31, pas à minuit. C'est ce que fait
`upcomingSessions`, et c'est la raison d'être du `setInterval` d'une minute
posé dans `connectedCallback` — annulé dans `disconnectedCallback`, comme tout
timer de cette carte.

### Les indices de jour ne se recalculent pas côté carte

`weekday` vient de `datetime.weekday()` : **0 = lundi**. `Date.getDay()` compte
à partir du dimanche. Recalculer l'indice en TypeScript décalerait tout le
filtre « jours affichés » d'un rang, et rien — ni `tsc`, ni oxlint, ni un
coup d'œil sur la carte — ne le dirait. Même règle que `days_left`, qui dépend
du fuseau configuré dans Home Assistant et non de celui du navigateur.

## Le mode tuiles et sa spécification

Le mode `tiles` implémente la spécification « Card Escalade : tuiles jour »
v1.0 (19 septembre 2026), voie A. Trois écarts volontaires, à ne pas
« rattraper » sans relire ce qui suit.

- **« Fermé », pas « Annulé ».** La spécification prévoit `full` → « Complet »
  et `cancelled` → « Annulé ». Le site du club ne connaît que « Ouvert » et
  « Fermé » : c'est donc « Fermé » qui s'affiche, avec le rendu prévu pour une
  séance annulée — variante rouge et tuile à 0,7 d'opacité. Un libellé que
  l'adhérent ne retrouve pas sur la page du club lui ferait croire à une autre
  information. Le type `SlotStatus` reste ouvert si le club publie un jour
  « Complet ».
- **Pas d'opacité de retrait sur les séances fermées.** La spécification en
  prévoit une à 0,7. Elle existait pour distinguer une séance fermée quand rien
  d'autre ne le faisait ; depuis la 0.4, c'est la teinte de fond qui s'en
  charge, et **cumuler les deux faisait tomber le texte secondaire à 4,39:1**,
  sous le seuil. Chaque effet est inoffensif pris seul, ce qui rend le cumul
  invisible à la relecture — il n'a été vu qu'en calculant les contrastes.
- **`count` et `max` coexistent.** `count` (1–4) est le nombre de tuiles,
  `max` restait le plafond du mode liste. Les fusionner changerait le sens
  d'une configuration existante.

### Couleurs d'accent

Depuis la 0.3, `accent` est remplacé par `accent_open` et `accent_closed` —
**rupture assumée**, décidée pendant que la carte n'était installée nulle part.
Ne pas réintroduire de repli commun : il n'a plus aucun utilisateur, et il
rendrait `accentFor` dépendant d'un ordre de précédence que rien ne montre à
l'écran.

Depuis la 0.4, la teinte porte sur **toutes** les tuiles, pas seulement celle
du jour, et `accent_intensity` en règle la force. Un seul réglage et non deux :
les tuiles ordinaires reçoivent `TILE_INTENSITY_RATIO` de l'intensité, la tuile
du jour la totalité, ce qui garantit qu'elle reste la plus visible quel que
soit le réglage. Deux curseurs indépendants permettraient de les inverser.

Trois points à ne pas défaire :

- **L'accent est posé par tuile, pas sur la card.** Deux séances de statuts
  différents dans la même grille portent deux couleurs ; une propriété posée
  sur la card les uniformiserait sans que le typage ne dise rien.
- **La pastille de statut garde des couleurs fixes.** Elle a suivi l'accent le
  temps de la 0.3 : un accent clair choisi au nuancier la faisait passer sous
  4,5:1 sur la tuile sombre, sans que rien ne le signale. La couleur
  configurable est celle du fond, qui porte du texte clair et reste donc
  assombrie avant usage.
- **La valeur passe par une propriété personnalisée**, jamais par une
  déclaration composée en TypeScript. C'est ce qui permet de garder dans la
  feuille de styles le repli statique de `color-mix` — `styleMap` ne sait
  poser qu'une valeur par propriété, donc un navigateur sans `color-mix`
  n'aurait plus rien à afficher.

`buildShellStyle` (`helpers/shell.ts`) existe pour une seule raison : `card.ts`
est hors d'atteinte du runner — décorateurs — et une propriété perdue dans
l'assemblage du style ne casse ni le build ni le typage. La photo ou la teinte
disparaissent simplement à l'écran. C'est arrivé une fois. **Ne pas réintégrer
cet assemblage dans `card.ts`.**

`normalizeColor` accepte deux formes parce que deux sources existent : une
chaîne CSS venue du YAML, et le triplet `[r, g, b]` que renvoie le sélecteur
`color_rgb` de l'éditeur. Ses gardes ne sont pas décoratives — la valeur
atterrit dans une propriété que `color-mix` consomme, et un point-virgule y
refermerait la déclaration.

Le statut `unknown` n'est volontairement pas configurable, cf. la note du
README.

Non implémenté, conformément à la spécification qui le classe en P2 : le fond
SVG « mur d'escalade » dessiné, à ne produire que si aucune photo n'est
fournie. Sans `background`, la card retombe sur le fond uni du thème.

Les actions par séance (`url` de réservation) ne sont pas câblées : la page du
club n'expose ni lien ni libellé par créneau, donc le contrat `Session` les
laisse de côté plutôt que d'inventer un champ vide.

## Délais et fuseau horaire

`days_left`, `past`, `next_open`, `next_closed` et `today` ne sont **pas**
produits par le scraper : ils sont dérivés par `dates.with_derived`, appelé par
le coordinator au moment de **servir** les données, avec `dt_util.now().date()`.

Le scraper n'a pas accès à `hass`. `date.today()` y utiliserait le fuseau du
**système hôte** — souvent UTC en conteneur, alors que Home Assistant est
configuré sur Europe/Paris. C'est le défaut exact que la médiathèque a mis
longtemps à voir sur ses délais d'emprunt, et il se traduirait ici par un
« prochain créneau » qui saute la soirée même pendant les heures où les deux
fuseaux ne sont pas le même jour.

Deux conséquences à ne pas défaire :

- **Le cache disque garde la sortie brute du scraper**, sans champ dérivé. Y
  écrire `days_left` le figerait à la date du relevé : une journée
  d'indisponibilité du site servirait « dans 3 jours » pour un créneau déjà
  passé.
- **`with_derived` renvoie une copie.** Muter en place laisserait l'ancien
  `State` référencer les mêmes dicts, aucun `state_changed` ne serait émis au
  passage de minuit, et la carte afficherait le délai de la veille jusqu'au
  cycle suivant — une heure plus tard par défaut, donc un créneau du jour
  annoncé « demain » jusqu'à 1 h du matin.

**Un seul point d'entrée pour toutes les dérivations**, et non une fonction par
champ : les trois chemins qui servent des données — fetch réussi, repli sur
cache, pré-remplissage au démarrage — doivent appliquer exactement les mêmes.
Les appeler une par une à trois endroits est la forme qui laisse un chemin en
oublier une, en silence.

La règle `DTZ` de ruff verrouille le tout. Ses exemptions sont marquées
`# noqa: DTZ007` et portent toutes sur des dates civiles — un créneau est un
jour, pas un instant.

## Événements de changement de créneau

`changes.diff_slots` est le seul code de ce dépôt qui déclenche une action chez
l'utilisateur. Un faux positif lui apprend à ignorer ses notifications, un faux
négatif lui fait rater l'information pour laquelle il a installé
l'intégration ; aucun des deux ne se voit sur un tableau de bord.

Quatre règles, toutes couvertes par `tests/test_changes.py` :

- **Comparaison par date, jamais par position.** Le club retire les créneaux
  passés en tête de liste : les index glissent d'un relevé à l'autre, et une
  comparaison positionnelle signalerait une bascule imaginaire chaque semaine.
- **`previous is None` ⇒ aucun événement.** Une installation neuve enverrait
  sinon vingt notifications d'un coup — les dernières que l'utilisateur lirait.
  Une liste vide, elle, est un vrai relevé : une date qui apparaît est une
  nouvelle (`change: "added"`).
- **L'historique est amorcé sur le cache disque** (`EscaladeDataSource.__init__`),
  pas sur `None`. Ce qui a changé pendant que Home Assistant était arrêté est
  une vraie nouvelle, et c'est même le cas le plus utile.
- **Le repli sur cache n'émet rien.** Les créneaux servis sont ceux du dernier
  relevé réussi : prévenir d'une bascule qui n'a pas eu lieu est pire que se
  taire.

`notify_within_days` est un paramètre **requis** de `EscaladeDataSource` : un
défaut à 0 désactiverait les notifications en silence si un appelant l'oubliait
— aucune erreur, aucun log, CI verte.

L'intégration émet sur le bus et **ne notifie pas elle-même**. Elle n'a pas à
savoir si l'adhérent veut une notification mobile, une lampe rouge ou rien du
tout ; c'est ce que décide son automatisation.

## Où vit la logique testable

`sensor.py` **n'est pas importable** sous les mocks de `tests/conftest.py` :
`class _EscaladeBase(CoordinatorEntity, SensorEntity)` lève un conflit de
métaclasse quand les deux bases sont des MagicMock. Tout ce qui y vit est donc
hors de portée des tests, et la suite reste verte quoi qu'on y casse. Même
contrainte pour `config_flow.py`, qui dérive de `ConfigFlow`.

C'est pourquoi la logique en est sortie :

- `coordinator.py` — obtention, cache, repli, émission des événements ;
- `dates.py` — tout ce qui dépend du jour courant ;
- `changes.py` — détection des bascules ;
- `_async_refresh` et `update_entry_and_ensure_reload` dans `__init__.py`,
  sortis de leurs closures pour la même raison.

**Ne pas y remettre de logique**, et ne rien réintroduire dans une closure de
`async_setup_entry` : ce qui y entre devient invisible aux tests sans que rien
ne le signale. `tests/test_imports.py::TestTestableModulesStayImportable`
vérifie que ces modules restent importables sous les mocks — le jour où l'un
d'eux importerait `SensorEntity`, **tous** ses tests disparaîtraient de la
collecte sans qu'aucun ne devienne rouge.

## Données d'exécution

Le client et le coordinator vivent dans `entry.runtime_data`
(`coordinator.EscaladeRuntimeData`), **pas** dans `hass.data[DOMAIN][entry_id]`.

Deux filtres dans `_calendar_entries`, et **les deux sont nécessaires** :

- `runtime_data` n'existe pas tant qu'`async_setup_entry` ne l'a pas posé, et
  Home Assistant le supprime **au déchargement réussi seulement**. Ça écarte
  les entrées désactivées, ignorées et déchargées, sans rien entretenir à la
  main.
- l'état, parce que `runtime_data` est posé en première instruction et
  **survit à un setup qui échoue ensuite**. Sans ce filtre, une entrée restée
  en erreur compte encore comme utilisable et retient le service `refresh`
  indéfiniment.

`async_remove_entry` n'exclut pas l'entrée en cours de suppression : Home
Assistant la décharge avant d'appeler le handler, donc le filtre d'état s'en
charge. **Ne pas se fier à sa présence dans la collection** : HA a inversé
l'ordre en 2025.3.

**Rien ne fait respecter l'affectation de `runtime_data`.** L'attribut n'a pas
de défaut et son absence est silencieuse — `_calendar_entries` l'écarte par un
`getattr`. Ne jamais le poser rendrait l'intégration entièrement muette, CI
verte. D'où `tests/test_init.py::TestRuntimeDataIsActuallyWired`, qui lit la
source, `sensor.py` n'étant pas importable sous les mocks.

## Identifiants uniques des entités

Ils dérivent de l'`entry_id` (`coordinator.build_unique_id`), **jamais** d'une
option ni d'une donnée du site. Un identifiant qui dépend d'un réglage signifie
qu'en changer crée des entités neuves et orpheline les anciennes : tableau de
bord cassé, historique perdu, automatisations muettes. La médiathèque a payé
cette leçon sur son login et a dû écrire un module de migration ; ici rien ne
varie, et c'est exactement pourquoi il faut que ça le reste — il n'y a pas de
migration pour rattraper le coup.

## Rechargement de l'entrée de configuration

Un seul endroit recharge : le listener `async_update_options` (`__init__.py`).
Home Assistant déprécie `async_update_reload_and_abort` pour une intégration
qui enregistre un listener de mise à jour — c'est au listener de s'en charger —
avec une **casse annoncée en 2026.12**.

Le flux de reconfiguration passe donc par `update_entry_and_ensure_reload`
(`__init__.py`), qui appelle `async_update_entry` puis programme le rechargement
lui-même dans les deux cas où **aucun listener n'est appelé** :

- l'entrée n'a pas changé — reconfiguration rouverte puis resoumise à
  l'identique — `async_update_entry` renvoyant alors `False` sans rien
  notifier ;
- aucun listener n'est enregistré : entrée désactivée, ou `async_setup_entry`
  interrompu avant `add_update_listener`.

Le listener **ne doit pas** être conditionné aux options : ça rendrait une
reconfiguration sans effet, puisqu'elle ne touche que les données. **Ne pas
passer à `OptionsFlowWithReload`** non plus, malgré son nom engageant : sa
propre docstring interdit de l'employer quand l'intégration enregistre un
listener de mise à jour.

Le helper vit dans `__init__.py` et non dans le flux, `config_flow.py` n'étant
pas importable sous les mocks : un helper qui y resterait ne serait couvert que
par analyse de source, ce qui avait déjà donné un test vert sur une garde
inversée dans le dépôt d'origine.

## Traductions

`strings.json` n'est **jamais lu à l'exécution** pour une intégration
personnalisée : Home Assistant ne charge que `translations/<langue>.json`, avec
repli sur `en`. Une clé présente dans le seul `strings.json` s'affiche donc en
clé brute à l'utilisateur.

`en.json` n'est pas optionnel : `en` est la langue de **repli** de Home
Assistant, donc ce que voit tout utilisateur non francophone. On pourrait
croire que `async_update_reload_and_abort` ferait résoudre nos raisons d'abandon
par le cœur en passant `translation_domain` : **`FlowHandler.async_abort`
n'accepte toujours pas ce paramètre**, vérifié jusqu'en 2026.1.

`tests/test_translations.py` croise le flux et **tous** les fichiers ; ne pas le
restreindre à `strings.json`.

## Méthode de diagnostic

Le chemin nominal de la carte est instrumenté à dessein (`setConfig accepté`,
`premier rendu effectué`, horodatages). **Ne pas retirer ces logs** : sans eux,
« aucun log » est ambigu entre « HA n'a jamais utilisé notre élément » et « tout
s'est bien passé », et c'est ce raisonnement faux qui a fait perdre le plus de
temps sur le dépôt d'origine.

Pour extraire la configuration réelle d'une carte d'erreur, depuis la console :

```js
(function w(n){if(!n)return;if(String(n.localName).startsWith('hui-error'))console.log('>>>',JSON.stringify(n._config??n.config));[...(n.shadowRoot?.children??[]),...(n.children??[])].forEach(w)})(document.body)
```

Pour voir passer les événements de changement : *Outils de développement →
Événements*, écouter `escalade_veauche_slot_changed`, puis appeler
`escalade_veauche.refresh`.

## Build

Le bundle `custom_components/escalade_veauche/www/escalade-card.js` est commité
et la CI vérifie qu'il correspond aux sources. Après toute modification de
`frontend/src/`, lancer `cd frontend && npm run build` avant de commiter.

Les versions sont mises à jour automatiquement par le workflow de release à
partir du tag, dans **six** fichiers : `manifest.json`, `CARD_VERSION` de
`__init__.py`, `frontend/src/version.ts`, `frontend/package.json`,
`frontend/package-lock.json`, et le bundle reconstruit. Ne pas les bumper à la
main. `tests/test_manifest.py` vérifie qu'ils restent synchronisés — une
substitution qui ne matche plus échoue silencieusement, et sur `CARD_VERSION`
ça ferait resservir un bundle périmé derrière un cache-buster frais.

## Linters

`ruff check .` — configuré dans `pyproject.toml`, exécuté en CI. Longueur de
ligne à 100 et non aux 88 de Home Assistant core, pour rester aligné sur le
dépôt d'origine.

`npm test` côté carte — le runner intégré de Node, sans vitest ni jest. Les
fonctions de `renders/` sont rendues dans un vrai DOM (`happy-dom`) puis
interrogées, plutôt qu'inspectées via les `strings` et `values` du
`TemplateResult` : un `@click` ne se distingue d'un autre qu'en le déclenchant.
C'est ce qui permet de voir ce que ni `tsc` ni oxlint ne voient — deux
paramètres de même type inversés, un gestionnaire branché sur le mauvais
élément.

**`helpers/slot.ts` compte au moins autant que les rendus.** Une erreur dans
`renders/` se voit à l'œil au premier chargement ; un seuil de délai qui bouge
ou un statut mal classé retire silencieusement des soirées de la liste.

Trois contraintes du harnais, dans `test/_setup.ts`, à ne pas défaire :

- le DOM est installé par `--import ./test/_setup.ts` et non par un import dans
  les fichiers de test : leurs imports statiques sont évalués avant leur corps,
  donc Lit se chargerait avant que `HTMLElement` existe ;
- `--conditions=browser` est nécessaire, sans quoi Node résout l'export
  « node » de Lit, qui suppose un rendu serveur et lève à l'import ;
- les globales de la famille `Event` viennent de happy-dom et **remplacent**
  celles de Node, qui refuse les siennes (« parameter 1 is not of type
  Event »). La règle porte sur toute la famille, pas sur une liste de noms.

Un crochet de résolution réécrit les imports `./x.js` des sources en `./x.ts`.
Le `.js` est une **convention du dépôt** — `moduleResolution` vaut `Bundler` —
mais le dépouillement de types de Node ne sait pas la suivre.

`card.ts` reste hors d'atteinte de ce runner : il utilise des décorateurs, que
le dépouillement de types de Node refuse. Ne pas y perdre de temps sans changer
d'outillage.

`npm run lint` côté TypeScript — **oxlint**, pas ESLint, qui a son propre
parser et aucune dépendance de pair sur TypeScript. Il tourne sur son ruleset
`correctness` par défaut, zéro constat. Ne pas élargir à `suspicious` ou
`pedantic` sans réfléchir : `no-underscore-dangle` y produit une trentaine de
faux positifs sur la convention `_private` des cartes Lovelace.

## Exécuter les tests

```
pip install -r requirements_test.txt
python scripts/manifest_requirements.py
pip install -r manifest-requirements.txt
pytest
ruff check .
(cd frontend && npm ci && npm run typecheck && npm run lint && npm test && npm run build)
git diff --exit-code --stat custom_components/escalade_veauche/www/escalade-card.js
```

Ce bloc reproduit les vérifications de la CI, et `tests/test_documentation.py`
compare les deux pour qu'ils ne divergent pas — découvrir l'écart en poussant
est le genre de friction que ce dépôt s'efforce de supprimer partout ailleurs.

Le sous-shell est volontaire : sans lui, un build en échec laisserait le shell
dans `frontend/`, et la ligne suivante échouerait à son tour sur un chemin
introuvable, en masquant le vrai problème.

La dernière ligne est celle qu'on oublie le plus souvent : le bundle commité
doit correspondre au build, et la CI échoue sinon. `--exit-code --stat` plutôt
que `--quiet`, qui sort en 1 sans rien afficher.

Les deux commandes du milieu sont nécessaires : les dépendances runtime
(`beautifulsoup4`, `requests`) ne sont pas recopiées dans
`requirements_test.txt`, elles viennent du manifeste, qui en est l'unique
source de vérité. Home Assistant n'est pas installé — `tests/conftest.py` le
simule. Le job `import-check` de la CI l'installe, lui, pour de vrai.

## Version minimale de Home Assistant

`2026.1.0`, déclarée dans `hacs.json`. **C'est une politique de support, plus
une dérivation des API utilisées** : seule la série 2026 est prise en charge.
Techniquement, la plus exigeante des API employées est
`OptionsFlow.config_entry`, qui n'a besoin que de 2024.12.

Ce qui reste vrai pour autant, et qu'il faut continuer à vérifier contre les
sources avant d'employer une API nouvelle :

- `async_register_static_paths` et `StaticPathConfig` → 2024.7 ;
- `getGridOptions()` de la carte → frontend `20241106.0`, soit 2024.11 ;
- `entry.runtime_data` et `ConfigEntry[T]` → 2024.6 ;
- `OptionsFlow.config_entry` → **2024.12**.

`tests/test_manifest.py` n'est qu'un cliquet : il empêche d'abaisser le
plancher, il ne peut pas détecter qu'une API récente exige davantage.

### Versions de Python

Elles suivent le plancher, et elles divergent à dessein entre les jobs :

- `target-version` de ruff et le job `test-python` sur **3.13**, le
  `REQUIRED_PYTHON_VER` de 2026.1 ;
- `import-check` tourne deux fois, sur les deux extrémités de l'intervalle
  supporté : **3.13 avec `homeassistant==2026.1.0`**, le plancher lui-même, et
  **3.14 avec la dernière**, qui l'exige depuis 2026.3. Sans la première, le
  plancher ne serait qu'un nombre dans `hacs.json` que rien n'exécute. Sans la
  seconde, on ne verrait pas l'amont casser l'intégration.

**Développer sur 3.13 au minimum.** La suite passe sur des versions plus
anciennes — `conftest.py` simule Home Assistant — mais ce vert ne prouve rien
pour un utilisateur du plancher.

## Ce que le site peut casser

Le seul risque réel de ce dépôt est que la page du club change. Trois points de
contact, par ordre de fragilité :

1. `<ul id="skill">` et ses `<li>` — sans eux, `parse_calendar` lève, le
   coordinator retombe sur son cache et l'utilisateur voit le bandeau de
   péremption. C'est le bon comportement : renvoyer une liste vide ferait
   afficher « aucun créneau » à tout le monde, ce qui ressemble à un club
   fermé.
2. Les mots « Ouvert » / « Fermé » — `parse_status` dépouille les accents et la
   casse, et retombe sur la couleur de la barre (`progressgreen` /
   `progressrouge`) quand le libellé n'est pas compris. Un statut incompris
   reste `None`, **jamais** « fermé » : annoncer une fermeture qui n'existe pas
   envoie l'adhérent grimper ailleurs un soir d'ouverture.
3. Le chapeau `<h1 class="title">` et ses `Mardi (19h00-21h30)` — purement
   éditorial, il a déjà été remanié. Son absence est tolérée : une carte sans
   horaires reste utile, une carte qui ne s'affiche plus ne l'est pas.

`tests/fixtures/calendrier.html` est une **capture réelle** de la page. C'est ce
qui donne sa valeur à `test_scraper.py` : un gabarit reconstitué à la main ne
prouverait que la cohérence du test avec lui-même. La rafraîchir quand le site
change, sans la remplacer par une version réduite.
