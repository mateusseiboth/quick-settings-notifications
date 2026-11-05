export const TopBarStyle = {
  DEFAULT: "default",
  TRANSPARENT: "transparent",
  TRANSPARENT_ZONES: "transparent-zones",
} as const;
export type TopBarStyle = (typeof TopBarStyle)[keyof typeof TopBarStyle];

export interface TopBarLook {
  readonly isTransparent: boolean;
  readonly hasZoneBadges: boolean;
}

const DEFAULT_LOOK: TopBarLook = { isTransparent: false, hasZoneBadges: false };

const LOOK_BY_STYLE: Record<string, TopBarLook> = {
  [TopBarStyle.DEFAULT]: DEFAULT_LOOK,
  [TopBarStyle.TRANSPARENT]: { isTransparent: true, hasZoneBadges: false },
  [TopBarStyle.TRANSPARENT_ZONES]: { isTransparent: true, hasZoneBadges: true },
};

export const resolveTopBarLook = (style: string): TopBarLook =>
  LOOK_BY_STYLE[style] ?? DEFAULT_LOOK;
