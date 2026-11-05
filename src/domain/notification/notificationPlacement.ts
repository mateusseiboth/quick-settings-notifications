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
  readonly gap: number;
  readonly scale: number;
}

export const resolveSeparatePanelOffset = ({
  quickSettingsHeight,
  gap,
  scale,
}: SeparatePanelOffsetInput): number => quickSettingsHeight + gap * scale;

export const resolveNotificationPlacement = ({
  isSeparatePanel,
}: NotificationPlacementPreference): NotificationPlacement =>
  isSeparatePanel ? NotificationPlacement.SEPARATE_PANEL : NotificationPlacement.QUICK_SETTINGS;
