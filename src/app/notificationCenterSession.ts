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
import { HeaderLayoutFeature } from "@feature/headerLayoutFeature";
import { MessagesIndicatorFeature } from "@feature/messagesIndicatorFeature";
import { MessageTrayShortcutFeature } from "@feature/messageTrayShortcutFeature";
import { NotificationListFeature } from "@feature/notificationListFeature";
import { PillTogglesFeature } from "@feature/pillTogglesFeature";
import { RoundTogglesFeature } from "@feature/roundTogglesFeature";
import { TopBarStyleFeature } from "@feature/topBarStyleFeature";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { FeatureSet, type FeaturePhase } from "@service/featureSet";

export const createFeatures = (settings: Gio.Settings): Feature[] => [
  new BannerPositionFeature(settings),
  new MessageTrayShortcutFeature(),
  new NotificationListFeature(settings),
  new MessagesIndicatorFeature(),
  new HeaderLayoutFeature(),
  new RoundTogglesFeature(settings),
  new PillTogglesFeature(settings),
  new TopBarStyleFeature(settings),
];

/**
 * Preferência alterada -> features reaplicadas JUNTAS (`restartAll`). Redondo e pílula mexem
 * nos mesmos toggles: as duas desligam antes de qualquer uma ligar.
 */
const FEATURES_BY_SETTING: Record<SettingsKey, readonly FeatureId[]> = {
  [SettingsKey.BANNER_POSITION]: [FeatureId.BANNER_POSITION],
  [SettingsKey.ROUND_TOGGLES]: [FeatureId.ROUND_TOGGLES, FeatureId.PILL_TOGGLES],
  [SettingsKey.SEPARATE_NOTIFICATION_PANEL]: [FeatureId.NOTIFICATION_LIST],
  [SettingsKey.TOP_BAR_STYLE]: [FeatureId.TOP_BAR_STYLE],
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
    this.settingIds = Object.entries(FEATURES_BY_SETTING).map(([key, featureIds]) =>
      this.settings.connect(`changed::${key}`, () => this.features.restartAll(featureIds)),
    );
  }

  stop(): void {
    this.settingIds.forEach((id) => this.settings.disconnect(id));
    this.settingIds = [];
    this.features.disableAll();
  }
}
