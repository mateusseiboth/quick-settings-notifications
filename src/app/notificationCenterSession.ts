/**
 * Raiz de composição (factory): cria as features na ordem certa e reaplica a que depende
 * de uma preferência quando ela muda.
 *
 * A ordem importa: a lista de notificações entra na grade ANTES dos toggles redondos, para
 * que a conversão de colunas a encontre e a estique para a largura total.
 */
import type Gio from "gi://Gio";

import type { Feature } from "@domain/feature/feature";
import { FeatureId } from "@domain/feature/featureId";
import { BannerPositionFeature } from "@feature/bannerPositionFeature";
import { MessagesIndicatorFeature } from "@feature/messagesIndicatorFeature";
import { MessageTrayShortcutFeature } from "@feature/messageTrayShortcutFeature";
import { NotificationListFeature } from "@feature/notificationListFeature";
import { RoundTogglesFeature } from "@feature/roundTogglesFeature";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { FeatureSet, type FeaturePhase } from "@service/featureSet";

export const createFeatures = (settings: Gio.Settings): Feature[] => [
  new BannerPositionFeature(settings),
  new MessageTrayShortcutFeature(),
  new NotificationListFeature(),
  new MessagesIndicatorFeature(),
  new RoundTogglesFeature(settings),
];

/** Preferência alterada -> feature reaplicada. */
const FEATURE_BY_SETTING: Record<SettingsKey, FeatureId> = {
  [SettingsKey.BANNER_POSITION]: FeatureId.BANNER_POSITION,
  [SettingsKey.ROUND_TOGGLES]: FeatureId.ROUND_TOGGLES,
};

const logFeatureError = (id: string, phase: FeaturePhase, error: unknown): void =>
  console.error(`[quick-settings-notifications] ${id} (${phase}):`, error);

export class NotificationCenterSession {
  private readonly features: FeatureSet;
  private settingIds: number[] = [];

  constructor(private readonly settings: Gio.Settings) {
    this.features = new FeatureSet(createFeatures(settings), logFeatureError);
  }

  start(): void {
    this.features.enableAll();
    this.settingIds = Object.entries(FEATURE_BY_SETTING).map(([key, featureId]) =>
      this.settings.connect(`changed::${key}`, () => this.features.restart(featureId)),
    );
  }

  stop(): void {
    this.settingIds.forEach((id) => this.settings.disconnect(id));
    this.settingIds = [];
    this.features.disableAll();
  }
}
