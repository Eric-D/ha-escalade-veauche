export const ESCALADE_CARD_VERSION = '0.3.0';

export function logBanner(): void {
  // console volontaire : c'est la convention des cartes Lovelace, et le bandeau
  // de version est le premier élément de diagnostic de ce projet.
  console.info(
    `%c ESCALADE-CARD %c ${ESCALADE_CARD_VERSION} IS INSTALLED `,
    'color: white; background: #1565c0; font-weight: bold;',
    'color: #1565c0; background: #bbdefb; font-weight: bold;'
  );
}

type LogLevel = 'info' | 'warn' | 'error';

export function ecLog(
  level: LogLevel,
  card: string,
  msg: string,
  ...args: unknown[]
): void {
  const prefix = `%c ESCALADE-CARD %c [${card}]`;
  const styles = [
    'color: white; background: #1565c0; font-weight: bold;',
    'color: #1565c0; font-weight: bold;',
  ];
  // console volontaire : voir logBanner.
  console[level](prefix + ' ' + msg, ...styles, ...args);
}
