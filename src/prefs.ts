/**
 * Preferências (GTK 4 + libadwaita): posição do banner e toggles redondos.
 */
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { BannerPosition } from "@domain/banner/bannerPosition";
import { SettingsKey } from "@infra/gnome/settingsKeys";

interface PositionOption {
  readonly value: BannerPosition;
  readonly label: () => string;
}

const POSITION_OPTIONS: readonly PositionOption[] = [
  { value: BannerPosition.TOP_LEFT, label: () => _("Top left") },
  { value: BannerPosition.TOP_CENTER, label: () => _("Top center") },
  { value: BannerPosition.TOP_RIGHT, label: () => _("Top right") },
];

export default class QuickSettingsNotificationsPreferences extends ExtensionPreferences {
  override async fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
    const settings = this.getSettings();
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({ title: _("Appearance") });

    group.add(this.buildBannerPositionRow(settings));
    group.add(this.buildRoundTogglesRow(settings));
    page.add(group);
    window.add(page);
  }

  private buildBannerPositionRow(settings: Gio.Settings): Adw.ComboRow {
    const row = new Adw.ComboRow({
      title: _("Notification banner position"),
      model: Gtk.StringList.new(POSITION_OPTIONS.map((option) => option.label())),
    });

    const current = POSITION_OPTIONS.findIndex(
      (option) => option.value === settings.get_string(SettingsKey.BANNER_POSITION),
    );
    row.set_selected(Math.max(current, 0));
    row.connect("notify::selected", () => {
      const option = POSITION_OPTIONS[row.get_selected()];
      if (option) settings.set_string(SettingsKey.BANNER_POSITION, option.value);
    });

    return row;
  }

  private buildRoundTogglesRow(settings: Gio.Settings): Adw.SwitchRow {
    const row = new Adw.SwitchRow({ title: _("Round quick toggles") });
    settings.bind(SettingsKey.ROUND_TOGGLES, row, "active", Gio.SettingsBindFlags.DEFAULT);
    return row;
  }
}
