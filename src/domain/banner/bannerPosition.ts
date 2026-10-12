/**
 * Posição do banner de notificação (preferência) e o alinhamento horizontal que ela pede.
 * O banner já nasce no topo; só o eixo horizontal muda.
 */

export const BannerPosition = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
} as const;
export type BannerPosition = (typeof BannerPosition)[keyof typeof BannerPosition];

export const BannerAlignment = {
  START: "start",
  CENTER: "center",
  END: "end",
} as const;
export type BannerAlignment = (typeof BannerAlignment)[keyof typeof BannerAlignment];

const ALIGNMENT_BY_POSITION: Record<string, BannerAlignment> = {
  [BannerPosition.TOP_LEFT]: BannerAlignment.START,
  [BannerPosition.TOP_CENTER]: BannerAlignment.CENTER,
  [BannerPosition.TOP_RIGHT]: BannerAlignment.END,
};

export const resolveBannerAlignment = (position: string): BannerAlignment =>
  ALIGNMENT_BY_POSITION[position] ?? BannerAlignment.END;
