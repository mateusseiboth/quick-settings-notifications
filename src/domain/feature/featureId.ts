/**
 * Identificadores das features (fonte única: usados nas classes, nos logs e no mapa de
 * preferência -> feature).
 */
export const FeatureId = {
  BANNER_POSITION: "banner-position",
  MESSAGE_TRAY_SHORTCUT: "message-tray-shortcut",
  NOTIFICATION_LIST: "notification-list",
  MESSAGES_INDICATOR: "messages-indicator",
  ROUND_TOGGLES: "round-toggles",
} as const;
export type FeatureId = (typeof FeatureId)[keyof typeof FeatureId];
