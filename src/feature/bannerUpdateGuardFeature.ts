import { State } from "resource:///org/gnome/shell/ui/messageTray.js";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { guardMethod } from "@domain/patch/guardMethod";
import { requireMessageTray, type MessageTrayInternals } from "@infra/gnome/shellInternals";

const isBannerVisible = (tray: MessageTrayInternals): boolean =>
  tray._notificationState !== State.HIDING;

export class BannerUpdateGuardFeature extends UndoableFeature {
  readonly id = FeatureId.BANNER_UPDATE_GUARD;

  protected apply(): void {
    const tray = requireMessageTray();
    this.undo.apply(
      () => guardMethod(tray, "_updateShowingNotification", isBannerVisible),
      (restore) => restore(),
    );
  }
}
