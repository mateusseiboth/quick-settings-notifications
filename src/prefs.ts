/**
 * Preferências (GTK 4 + libadwaita): posição do banner, formato dos botões rápidos, painel
 * de notificações separado e estilo da barra superior.
 */
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { BannerPosition } from "@domain/banner/bannerPosition";
import { TopBarStyle } from "@domain/panel/topBarStyle";
import { SettingsKey } from "@infra/gnome/settingsKeys";

interface ChoiceOption {
  readonly value: string;
  readonly label: () => string;
}

interface ChoiceRow {
  readonly key: SettingsKey;
  readonly title: () => string;
  readonly options: readonly ChoiceOption[];
}

interface SwitchRow {
  readonly key: SettingsKey;
  readonly title: () => string;
}

const BANNER_POSITION_ROW: ChoiceRow = {
  key: SettingsKey.BANNER_POSITION,
  title: () => _("Notification banner position"),
  options: [
    { value: BannerPosition.TOP_LEFT, label: () => _("Top left") },
    { value: BannerPosition.TOP_CENTER, label: () => _("Top center") },
    { value: BannerPosition.TOP_RIGHT, label: () => _("Top right") },
  ],
};

const TOP_BAR_STYLE_ROW: ChoiceRow = {
  key: SettingsKey.TOP_BAR_STYLE,
  title: () => _("Top bar"),
  options: [
    { value: TopBarStyle.DEFAULT, label: () => _("Default") },
    { value: TopBarStyle.TRANSPARENT, label: () => _("Transparent") },
    { value: TopBarStyle.TRANSPARENT_ZONES, label: () => _("Transparent with badges") },
  ],
};

const ROUND_TOGGLES_ROW: SwitchRow = {
  key: SettingsKey.ROUND_TOGGLES,
  title: () => _("Round quick toggles"),
};

const SEPARATE_NOTIFICATION_PANEL_ROW: SwitchRow = {
  key: SettingsKey.SEPARATE_NOTIFICATION_PANEL,
  title: () => _("Notifications in a separate panel"),
};

export default class QuickSettingsNotificationsPreferences extends ExtensionPreferences {
  override async fillPreferencesWindow(window: Adw.PreferencesWindow): Promise<void> {
    const settings = this.getSettings();
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({ title: _("Appearance") });

    group.add(this.buildChoiceRow(settings, BANNER_POSITION_ROW));
    group.add(this.buildSwitchRow(settings, ROUND_TOGGLES_ROW));
    group.add(this.buildSwitchRow(settings, SEPARATE_NOTIFICATION_PANEL_ROW));
    group.add(this.buildChoiceRow(settings, TOP_BAR_STYLE_ROW));
    page.add(group);
    window.add(page);
  }

  private buildChoiceRow(settings: Gio.Settings, { key, title, options }: ChoiceRow): Adw.ComboRow {
    const row = new Adw.ComboRow({
      title: title(),
      model: Gtk.StringList.new(options.map((option) => option.label())),
    });

    const current = options.findIndex((option) => option.value === settings.get_string(key));
    row.set_selected(Math.max(current, 0));
    row.connect("notify::selected", () => {
      const option = options[row.get_selected()];
      if (option) settings.set_string(key, option.value);
    });

    return row;
  }

  private buildSwitchRow(settings: Gio.Settings, { key, title }: SwitchRow): Adw.SwitchRow {
    const row = new Adw.SwitchRow({ title: title() });
    settings.bind(key, row, "active", Gio.SettingsBindFlags.DEFAULT);
    return row;
  }
}
