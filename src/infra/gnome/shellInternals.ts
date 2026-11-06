import type Clutter from "gi://Clutter";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import type { QuickSettingsMenu } from "resource:///org/gnome/shell/ui/quickSettings.js";

export class ShellShapeError extends Error {
  constructor(part: string) {
    super(`GNOME Shell internals changed: ${part} not found.`);
    this.name = new.target.name;
  }
}

export interface MessageViewInternals extends St.Widget {
  readonly empty: boolean;
}

export interface MessageListInternals extends St.Widget {
  readonly _messageView: MessageViewInternals;
  readonly _clearButton: St.Button;
}

export interface EventCollapseInternals extends MessageListInternals {
  maybeCollapseMessageGroupForEvent(event: Clutter.Event): boolean;
}

export interface CaptureContainerInternals extends MessageListInternals {
  readonly _captureContainer: Clutter.Actor | null;
  setCaptureContainer(container: Clutter.Actor | null): void;
}

export interface DateMenuInternals {
  readonly _messageList: MessageListInternals;
  readonly _indicator: St.Icon;
}

export interface MessageTrayInternals {
  readonly _notificationState: number;
  _updateShowingNotification(): void;
}

export interface QuickSettingsLayoutInternals extends Clutter.LayoutManager {
  nColumns: number;
  readonly _overlay: Clutter.Actor;
}

export interface ToggleInternals extends St.Button {
  readonly _box: St.BoxLayout;
  readonly _icon: St.Icon;
  readonly _title: St.Label;
  readonly _subtitle: St.Label;
}

export interface MenuToggleInternals extends St.Button {
  readonly _box: St.BoxLayout;
  readonly _menuButton: St.Button;
  readonly menuEnabled: boolean;
  readonly menu: { open(): void };
}

export interface SystemItemInternals extends St.Widget {
  readonly child: St.BoxLayout;
  readonly _laptopSpacer: Clutter.Actor;
  readonly _desktopSpacer: Clutter.Actor;
}

export interface QuickSettingsInternals {
  readonly button: St.Widget & {
    addExternalIndicator(indicator: St.Widget, colSpan?: number): void;
  };
  readonly menu: QuickSettingsMenu;
  readonly grid: St.Widget;
  readonly layout: QuickSettingsLayoutInternals;
}

export const requireDateMenu = (): DateMenuInternals => {
  const dateMenu = Main.panel.statusArea.dateMenu as unknown as
    | Partial<DateMenuInternals>
    | undefined;
  if (!(dateMenu?._messageList instanceof St.Widget))
    throw new ShellShapeError("dateMenu._messageList");
  if (!(dateMenu._indicator instanceof St.Icon)) throw new ShellShapeError("dateMenu._indicator");
  return dateMenu as DateMenuInternals;
};

export const requireQuickSettings = (): QuickSettingsInternals => {
  const button = Main.panel.statusArea.quickSettings;
  if (!button) throw new ShellShapeError("panel.statusArea.quickSettings");

  const menu = button.menu;
  const grid = menu._grid;
  if (!(grid instanceof St.Widget)) throw new ShellShapeError("quickSettings.menu._grid");

  const layout = grid.layout_manager as unknown as QuickSettingsLayoutInternals;
  if (typeof layout?.nColumns !== "number")
    throw new ShellShapeError("QuickSettingsLayout.nColumns");

  return { button, menu, grid, layout };
};

export interface QuickSettingsPopupInternals {
  readonly container: St.Widget;
  readonly boxPointer: St.Widget;
}

export const requireQuickSettingsPopup = (menu: QuickSettingsMenu): QuickSettingsPopupInternals => {
  const container = menu.actor as unknown;
  const boxPointer = menu._boxPointer as unknown;
  if (!(container instanceof St.Widget)) throw new ShellShapeError("quickSettings.menu.actor");
  if (!(boxPointer instanceof St.Widget) || boxPointer.get_parent() !== container)
    throw new ShellShapeError("quickSettings.menu._boxPointer");
  return { container, boxPointer };
};

export interface TopBarInternals {
  readonly panel: St.Widget;
  readonly zones: readonly St.BoxLayout[];
}

interface PanelBoxes {
  readonly _leftBox?: unknown;
  readonly _centerBox?: unknown;
  readonly _rightBox?: unknown;
}

export const requireTopBar = (): TopBarInternals => {
  const panel = Main.panel as unknown;
  if (!(panel instanceof St.Widget)) throw new ShellShapeError("Main.panel");

  const { _leftBox, _centerBox, _rightBox } = panel as PanelBoxes;
  const zones = [_leftBox, _centerBox, _rightBox];
  if (!zones.every((zone) => zone instanceof St.BoxLayout))
    throw new ShellShapeError("panel._leftBox, _centerBox, _rightBox");

  return { panel, zones };
};

export const hasToggleInternals = (actor: Clutter.Actor): actor is ToggleInternals => {
  const candidate = actor as Partial<ToggleInternals>;
  return (
    candidate._box instanceof St.BoxLayout &&
    candidate._icon instanceof St.Icon &&
    candidate._title instanceof St.Label &&
    candidate._subtitle instanceof St.Label
  );
};

export const hasMenuToggleInternals = (actor: Clutter.Actor): actor is MenuToggleInternals => {
  const candidate = actor as Partial<MenuToggleInternals>;
  return (
    candidate._box instanceof St.BoxLayout &&
    candidate._menuButton instanceof St.Button &&
    !!candidate.menu
  );
};

const SYSTEM_ITEM_CLASS = "quick-settings-system-item";

export const requireSystemItem = (grid: St.Widget): SystemItemInternals => {
  const item = grid
    .get_children()
    .find(
      (child) => child instanceof St.Widget && child.has_style_class_name(SYSTEM_ITEM_CLASS),
    ) as Partial<SystemItemInternals> | undefined;

  if (!(item?.child instanceof St.BoxLayout)) throw new ShellShapeError("SystemItem.child");
  if (!item._laptopSpacer || !item._desktopSpacer) throw new ShellShapeError("SystemItem spacers");
  return item as SystemItemInternals;
};

export const requireMessageTray = (): MessageTrayInternals => {
  const tray = Main.messageTray as unknown as Partial<MessageTrayInternals>;
  if (typeof tray._updateShowingNotification !== "function")
    throw new ShellShapeError("messageTray._updateShowingNotification");
  if (typeof tray._notificationState !== "number")
    throw new ShellShapeError("messageTray._notificationState");
  return tray as MessageTrayInternals;
};

export const hasEventCollapseInternals = (
  messageList: MessageListInternals,
): messageList is EventCollapseInternals =>
  typeof (messageList as Partial<EventCollapseInternals>).maybeCollapseMessageGroupForEvent ===
  "function";

export const hasCaptureContainerInternals = (
  messageList: MessageListInternals,
): messageList is CaptureContainerInternals =>
  typeof (messageList as Partial<CaptureContainerInternals>).setCaptureContainer === "function";
