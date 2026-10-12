/**
 * Quantas colunas cada item ocupa quando a grade do Quick Settings muda de tamanho.
 */

/** Toggles redondos: quatro por linha, como no mockup do GNOME Design. */
export const ROUND_TOGGLE_COLUMNS = 4;

export interface ColumnSpanInput {
  readonly isToggle: boolean;
  readonly span: number;
  readonly from: number;
  readonly to: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const scaleColumnSpan = ({ isToggle, span, from, to }: ColumnSpanInput): number => {
  if (isToggle) return 1;
  if (span >= from) return to;

  return clamp(Math.round((span * to) / from), 1, to);
};
