import { css } from 'lit';

/** Aucune ressource distante : pas de CDN, pas de police téléchargée. La carte
    doit s'afficher dans la WebView Android de l'application Home Assistant,
    hors connexion au site du club. */
export const cardStyles = css`
  :host {
    display: block;
  }
  .escalade-header {
    padding: 16px 16px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .escalade-title {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .escalade-header-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .escalade-count {
    border-radius: 12px;
    padding: 2px 10px;
    font-size: 0.85em;
    font-weight: 600;
    color: var(--text-primary-color, #fff);
    background: var(--primary-color);
    white-space: nowrap;
  }
  .escalade-count.highlight {
    background: #2e7d32;
    color: #fff;
  }
  .escalade-refresh {
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--secondary-background-color, #f0f0f0);
    color: var(--secondary-text-color);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 1em;
    line-height: 1;
    cursor: pointer;
  }
  .escalade-stale {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 16px 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: #fff3e0;
    color: #e65100;
    font-size: 0.82em;
  }
  .escalade-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .escalade-row:last-child {
    border-bottom: none;
  }
  .escalade-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .escalade-row-main {
    flex: 1;
    min-width: 0;
  }
  .escalade-row-day {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .escalade-day {
    font-size: 0.95em;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .escalade-date {
    font-size: 0.82em;
    color: var(--secondary-text-color);
  }
  .escalade-hours {
    font-size: 0.78em;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .escalade-row-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
  }
  .escalade-status {
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 0.75em;
    font-weight: 600;
    white-space: nowrap;
  }
  .escalade-delay {
    font-size: 0.72em;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  /* Seuls « aujourd'hui » et « demain » sont mis en avant : tout souligner ne
     hiérarchise plus rien. */
  .escalade-delay-today {
    color: #d84315;
    font-weight: 700;
  }
  .escalade-delay-tomorrow {
    color: #ef6c00;
    font-weight: 600;
  }
  .escalade-empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  .escalade-loader-box {
    padding: 32px 16px;
    text-align: center;
  }
  .escalade-loader-text {
    margin-top: 12px;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  .escalade-loader {
    width: 28px;
    height: 28px;
    margin: 0 auto;
    border: 3px solid var(--divider-color, #e0e0e0);
    border-top-color: var(--primary-color, #1565c0);
    border-radius: 50%;
    animation: escalade-spin 0.9s linear infinite;
  }
  @keyframes escalade-spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* Respecte le réglage système : une animation perpétuelle dans une carte de
     tableau de bord est exactement ce que ce réglage vise. */
  @media (prefers-reduced-motion: reduce) {
    .escalade-loader {
      animation: none;
    }
  }
`;
