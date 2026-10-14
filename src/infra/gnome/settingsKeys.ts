/**
 * Nomes das chaves GSettings da extensão (fonte única; o schema XML usa os mesmos).
 */
export const SettingsKey = {
  BANNER_POSITION: "banner-position",
  ROUND_TOGGLES: "round-toggles",
  SEPARATE_NOTIFICATION_PANEL: "separate-notification-panel",
  TOP_BAR_STYLE: "top-bar-style",
} as const;
export type SettingsKey = (typeof SettingsKey)[keyof typeof SettingsKey];
