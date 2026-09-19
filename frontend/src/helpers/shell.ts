/** Assemblage du style de la card en mode tuiles.

Extrait de `card.ts`, qui est hors d'atteinte du runner de tests — il utilise
des décorateurs que le dépouillement de types de Node refuse. Une régression y
est donc invisible : supprimer une propriété par mégarde ne casse rien de
visible au build, et la photo ou l'accent disparaissent simplement à l'écran.
C'est arrivé une fois, d'où ce module.
*/

export interface ShellStyleOptions {
  /** Chemin déjà validé, ou undefined. */
  background?: string;
  overlay: number;
  intensity: number;
}

/** Déclarations CSS de la card, dans l'ordre, séparées par des points-virgules.

    Une propriété par valeur dynamique, toutes consommées par des règles de la
    feuille de styles : c'est ce qui permet d'y garder les replis statiques de
    `color-mix`, qu'une déclaration composée ici ne saurait pas écrire.
*/
export function buildShellStyle({
  background,
  overlay,
  intensity,
}: ShellStyleOptions): string {
  const declarations = [
    background ? `background-image:url("${background}")` : '',
    `--esc-overlay:${overlay}`,
    `--esc-intensity:${intensity}`,
  ];
  return declarations.filter(Boolean).join(';');
}
