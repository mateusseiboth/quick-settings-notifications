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

export interface SeparatePanelOffsetInput {
  readonly quickSettingsHeight: number;
  /** Espaço entre os dois cartões, em pixels lógicos. */
  readonly gap: number;
  readonly scale: number;
}

/** Distância do topo do Quick Settings até o topo do painel separado. */
export const resolveSeparatePanelOffset = ({
  quickSettingsHeight,
  gap,
  scale,
}: SeparatePanelOffsetInput): number => quickSettingsHeight + gap * scale;

export const resolveNotificationPlacement = ({
  isSeparatePanel,
}: NotificationPlacementPreference): NotificationPlacement =>
  isSeparatePanel ? NotificationPlacement.SEPARATE_PANEL : NotificationPlacement.QUICK_SETTINGS;
