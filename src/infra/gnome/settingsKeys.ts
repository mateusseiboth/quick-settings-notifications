/**
 * Nomes das chaves GSettings da extensão (fonte única; o schema XML usa os mesmos).
 */
export const SettingsKey = {
  BANNER_POSITION: "banner-position",
  ROUND_TOGGLES: "round-toggles",
} as const;
export type SettingsKey = (typeof SettingsKey)[keyof typeof SettingsKey];
