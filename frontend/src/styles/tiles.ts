import { css } from 'lit';

/** Mode « tuiles » : hauteur minimale, ni en-tête ni compteur.

    Les valeurs dynamiques — photo, opacité du voile, accent — passent par des
    propriétés personnalisées posées sur la card, jamais par des déclarations
    construites à la main. Ça permet de garder ici un **repli statique** pour
    `color-mix`, impossible à écrire avec `styleMap` qui ne pose qu'une valeur
    par propriété : sur un navigateur sans `color-mix`, la première
    déclaration tient et la tuile du jour reste lisible.
*/
export const tilesStyles = css`
  .esc-tiles-card {
    position: relative;
    overflow: hidden;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .esc-tiles-card.clickable {
    cursor: pointer;
  }
  /* Le voile est un calque séparé et non un dégradé sur l'image : sans photo,
     il n'est pas rendu du tout, et le fond de card du thème reste intact. */
  .esc-veil {
    position: absolute;
    inset: 0;
    background: rgba(17, 17, 17, var(--esc-overlay, 0.35));
    pointer-events: none;
  }
  .esc-tiles-body {
    position: relative;
    padding: 12px;
  }
  .esc-tiles {
    display: grid;
    grid-template-columns: repeat(var(--esc-columns, 3), minmax(0, 1fr));
    gap: 10px;
  }
  .esc-tile {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 10px;
    /* Accent assombri : la teinte se pose sous un texte clair, donc elle doit
       rester sombre. Une couleur vive en fond ferait tomber le contraste du
       gris secondaire sous le seuil. */
    --esc-accent-dark: color-mix(in srgb, var(--esc-accent, #2196f3) 62%, black);
    /* Les tuiles ordinaires ne reçoivent qu'une fraction de l'intensité : la
       séance du jour doit rester la plus visible de la grille, et un seul
       réglage vaut mieux que deux qu'il faudrait accorder. */
    --esc-tile-alpha: calc(var(--esc-intensity, 0.88) * 0.4);
    /* Le verre neutre reste en couleur de fond, la teinte est un calque
       d'image par-dessus : sur une photo, remplacer le verre par la teinte
       rendrait la tuile transparente et le texte illisible. */
    background-color: rgba(22, 22, 22, 0.62);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--primary-text-color);
    /* min-width:0 sur une piste de grille : sans lui, un horaire un peu long
       force la colonne à s'élargir et la grille déborde de la card. */
    min-width: 0;
  }
  /* Plus d'opacité de retrait sur les séances fermées : elle existait pour les
     distinguer quand rien d'autre ne le faisait, et c'est désormais le rôle de
     la teinte de fond. Cumuler les deux faisait tomber le texte secondaire à
     4,39:1 sur une tuile fermée — sous le seuil de 4,5:1, et invisible à la
     relecture puisque chaque effet est inoffensif pris seul.

     Conséquence assumée : à « accent_intensity: 0 », plus rien ne distingue un
     soir fermé sans activer « show_status ». C'est un réglage explicite, pas
     un défaut. */
  /* Teinte de fond, appliquée dès que le statut est connu. Un statut non
     reconnu reste sur le verre neutre : lui donner une couleur en ferait une
     troisième catégorie de créneau. */
  .esc-tile.tinted {
    background-image: linear-gradient(
      color-mix(in srgb, var(--esc-accent-dark) calc(var(--esc-tile-alpha) * 100%), transparent),
      color-mix(in srgb, var(--esc-accent-dark) calc(var(--esc-tile-alpha) * 100%), transparent)
    );
  }
  .esc-tile.today {
    --esc-tile-alpha: var(--esc-intensity, 0.88);
    color: #fff;
  }
  /* Replis pour un navigateur sans color-mix — une WebView Android un peu
     ancienne. Statiques, donc par statut : la teinte y est figée aux couleurs
     du thème par défaut, mais la tuile du jour reste lisible. */
  @supports not (background: color-mix(in srgb, red 50%, blue)) {
    .esc-tile.today.status-open {
      background-color: rgba(47, 109, 50, 0.88);
    }
    .esc-tile.today.status-closed {
      background-color: rgba(151, 42, 33, 0.88);
    }
    .esc-tile.today.status-unknown {
      background-color: rgba(21, 97, 158, 0.88);
    }
  }
  .esc-weekday {
    font-weight: 500;
    font-size: 11px;
    line-height: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #b8b8b8;
  }
  .esc-daynum {
    font-weight: 700;
    font-size: 30px;
    line-height: 34px;
  }
  .esc-month {
    font-weight: 400;
    font-size: 11px;
    line-height: 14px;
    color: #b8b8b8;
  }
  .esc-tile.today .esc-weekday,
  .esc-tile.today .esc-month {
    color: rgba(255, 255, 255, 0.85);
  }
  .esc-time {
    margin-top: 6px;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    white-space: nowrap;
  }
  .esc-bottom {
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    font-weight: 400;
    font-size: 11px;
    line-height: 14px;
  }
  .esc-countdown {
    color: #b8b8b8;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .esc-tile.today .esc-countdown {
    color: #fff;
  }
  .esc-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .esc-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  /* Variantes claires fixes, et non dérivées de l'accent : la couleur
     configurable est celle du fond. Une pastille qui suivrait un accent choisi
     très clair passerait sous 4,5:1 sur la tuile sombre, et rien ne le
     signalerait. */
  .esc-status-open {
    color: #81c784;
  }
  .esc-status-closed {
    color: #ef9a9a;
  }
  /* Sur l'accent foncé, les variantes claires tombent sous 4,5:1 : le blanc
     est le seul choix qui tienne le contraste, et le libellé porte déjà
     l'information que la couleur dédouble. */
  .esc-tile.today .esc-status {
    color: #fff;
  }
  .esc-tiles-empty {
    position: relative;
    padding: 12px;
    font-size: 13px;
    line-height: 18px;
    color: var(--secondary-text-color);
  }
`;
