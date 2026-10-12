/**
 * Ponto de entrada: notificações no Quick Settings, toggles redondos e banner no topo
 * direito. Toda a montagem está em `NotificationCenterSession`.
 */
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import { NotificationCenterSession } from "@app/notificationCenterSession";

export default class QuickSettingsNotificationsExtension extends Extension {
  private session: NotificationCenterSession | null = null;

  override enable(): void {
    this.session = new NotificationCenterSession(this.getSettings());
    this.session.start();
  }

  override disable(): void {
    this.session?.stop();
    this.session = null;
  }
}
