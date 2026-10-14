/**
 * Onde a lista de notificações fica: no fim da grade do Quick Settings, ou num painel
 * próprio logo abaixo dele (mockup com os players de mídia em cartões separados).
 */

export const NotificationPlacement = {
  QUICK_SETTINGS: "quick-settings",
  SEPARATE_PANEL: "separate-panel",
} as const;
export type NotificationPlacement =
  (typeof NotificationPlacement)[keyof typeof NotificationPlacement];

export interface NotificationPlacementPreference {
  readonly isSeparatePanel: boolean;
}

export const resolveNotificationPlacement = ({
  isSeparatePanel,
}: NotificationPlacementPreference): NotificationPlacement =>
  isSeparatePanel ? NotificationPlacement.SEPARATE_PANEL : NotificationPlacement.QUICK_SETTINGS;
