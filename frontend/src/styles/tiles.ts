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
    background: rgba(22, 22, 22, 0.62);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--primary-text-color);
    /* min-width:0 sur une piste de grille : sans lui, un horaire un peu long
       force la colonne à s'élargir et la grille déborde de la card. */
    min-width: 0;
  }
  /* Une séance fermée reste lisible mais s'efface. L'opacité ne dépend pas de
     « show_status » : sans elle, un soir fermé serait indiscernable d'un soir
     ouvert dès que l'utilisateur masque les statuts — c'est-à-dire par
     défaut. */
  .esc-tile.closed {
    opacity: 0.7;
  }
  .esc-tile.today {
    background: rgba(21, 97, 158, 0.88);
    background: color-mix(
      in srgb,
      color-mix(in srgb, var(--esc-accent, #2196f3) 62%, black) 88%,
      transparent
    );
    color: #fff;
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
  /* La pastille est une variante claire de l'accent : sur la tuile sombre,
     l'accent brut passe sous 4,5:1. Deux déclarations, la seconde ignorée
     sans color-mix — c'est tout l'intérêt de passer par une propriété
     personnalisée plutôt que de composer la couleur en TypeScript. */
  .esc-status-open {
    color: #81c784;
    color: color-mix(in srgb, var(--esc-accent, #4caf50) 65%, white);
  }
  .esc-status-closed {
    color: #ef9a9a;
    color: color-mix(in srgb, var(--esc-accent, #f44336) 65%, white);
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
