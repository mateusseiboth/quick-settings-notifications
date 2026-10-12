/**
 * Super+V ("mostrar a lista de notificações") passa a abrir o Quick Settings, que é onde
 * as notificações ficam agora. Ao desligar, volta a abrir o calendário.
 */
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";

const KEYBINDING = "toggle-message-tray";

/** Mesmos modos com que o windowManager.js registra o atalho. */
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
