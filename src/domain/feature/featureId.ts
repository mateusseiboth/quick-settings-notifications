/**
 * Identificadores das features (fonte única: usados nas classes, nos logs e no mapa de
 * preferência -> feature).
 */
export const FeatureId = {
  BANNER_POSITION: "banner-position",
  MESSAGE_TRAY_SHORTCUT: "message-tray-shortcut",
  NOTIFICATION_LIST: "notification-list",
  MESSAGES_INDICATOR: "messages-indicator",
  HEADER_LAYOUT: "header-layout",
  ROUND_TOGGLES: "round-toggles",
  PILL_TOGGLES: "pill-toggles",
  TOP_BAR_STYLE: "top-bar-style",
} as const;
export type FeatureId = (typeof FeatureId)[keyof typeof FeatureId];
