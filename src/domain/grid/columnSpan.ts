/**
 * Onde cada item fica quando a grade do Quick Settings muda de 2 para 4 colunas.
 *
 * Só o toggle que ocupava UMA coluna vira redondo. O que ocupava a largura toda continua
 * assim e sem reestilo: o "aplicativos em segundo plano" é um QuickToggle de largura
 * total, e reduzi-lo a uma coluna fazia o texto dele esticar as 4 colunas.
 */

/** Toggles redondos: quatro por linha, como no mockup do GNOME Design. */
export const ROUND_TOGGLE_COLUMNS = 4;

export const GridPlacement = {
  ROUND_TOGGLE: "round-toggle",
  FULL_WIDTH: "full-width",
  SCALED: "scaled",
} as const;
export type GridPlacement = (typeof GridPlacement)[keyof typeof GridPlacement];

export interface GridItemInput {
  readonly isToggle: boolean;
  readonly span: number;
  readonly from: number;
  readonly to: number;
}

export interface GridItemPlacement {
  readonly kind: GridPlacement;
  readonly span: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const resolveGridPlacement = ({
  isToggle,
  span,
  from,
  to,
}: GridItemInput): GridItemPlacement => {
  if (span >= from) return { kind: GridPlacement.FULL_WIDTH, span: to };
  if (isToggle) return { kind: GridPlacement.ROUND_TOGGLE, span: 1 };

  return { kind: GridPlacement.SCALED, span: clamp(Math.round((span * to) / from), 1, to) };
};
