import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";

const KEYBINDING = "toggle-message-tray";

const ACTION_MODES = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW | Shell.ActionMode.POPUP;

export class MessageTrayShortcutFeature extends UndoableFeature {
  readonly id = FeatureId.MESSAGE_TRAY_SHORTCUT;

  protected apply(): void {
    Main.wm.setCustomKeybindingHandler(KEYBINDING, ACTION_MODES, () =>
      Main.panel.toggleQuickSettings(),
    );
    this.undo.push(() =>
      Main.wm.setCustomKeybindingHandler(KEYBINDING, ACTION_MODES, () =>
        Main.panel.toggleCalendar(),
      ),
    );
  }
}
