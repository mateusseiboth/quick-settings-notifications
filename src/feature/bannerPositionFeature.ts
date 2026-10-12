/**
 * Move o banner de notificação recebida para o canto escolhido (padrão: topo direito).
 * Usa o `bannerAlignment` público do `MessageTray`.
 */
import Clutter from "gi://Clutter";
import type Gio from "gi://Gio";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { BannerAlignment, resolveBannerAlignment } from "@domain/banner/bannerPosition";
import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { SettingsKey } from "@infra/gnome/settingsKeys";

const CLUTTER_ALIGNMENT: Record<BannerAlignment, Clutter.ActorAlign> = {
  [BannerAlignment.START]: Clutter.ActorAlign.START,
  [BannerAlignment.CENTER]: Clutter.ActorAlign.CENTER,
  [BannerAlignment.END]: Clutter.ActorAlign.END,
};

export class BannerPositionFeature extends UndoableFeature {
  readonly id = FeatureId.BANNER_POSITION;

  constructor(private readonly settings: Gio.Settings) {
    super();
  }

  protected apply(): void {
    const alignment = resolveBannerAlignment(this.settings.get_string(SettingsKey.BANNER_POSITION));

    this.undo.apply(
      () => {
        const previous = Main.messageTray.bannerAlignment;
        Main.messageTray.bannerAlignment = CLUTTER_ALIGNMENT[alignment];
        return previous;
      },
      (previous) => (Main.messageTray.bannerAlignment = previous),
    );
  }
}
