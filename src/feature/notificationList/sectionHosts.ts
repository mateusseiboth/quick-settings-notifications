import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import St from "gi://St";

import {
  NotificationPlacement,
  resolveSeparatePanelOffset,
  type NotificationPlacement as Placement,
} from "@domain/notification/notificationPlacement";
import type { UndoStack } from "@domain/undo/undoStack";
import {
  requireQuickSettingsPopup,
  type QuickSettingsInternals,
} from "@infra/gnome/shellInternals";

export interface SectionHost {
  attach(section: St.BoxLayout, quickSettings: QuickSettingsInternals, undo: UndoStack): St.Widget;
}

const PANEL_GAP = 12;

const ANIMATED_PROPERTIES = ["opacity", "translation-y"] as const;

const quickSettingsGridHost: SectionHost = {
  attach: (section, { menu, layout }, undo) => {
    menu.addItem(section, layout.nColumns);
    undo.push(() => section.destroy());
    return section;
  },
};

const followBoxPointer = (panel: St.Widget, boxPointer: St.Widget, undo: UndoStack): void => {
  const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
  const below = new Clutter.BindConstraint({
    source: boxPointer,
    coordinate: Clutter.BindCoordinate.Y,
  });
  const syncOffset = () =>
    (below.offset = resolveSeparatePanelOffset({
      quickSettingsHeight: boxPointer.height,
      gap: PANEL_GAP,
      scale,
    }));

  panel.add_constraint(
    new Clutter.BindConstraint({ source: boxPointer, coordinate: Clutter.BindCoordinate.X }),
  );
  panel.add_constraint(below);
  panel.add_constraint(
    new Clutter.BindConstraint({ source: boxPointer, coordinate: Clutter.BindCoordinate.WIDTH }),
  );

  const heightId = boxPointer.connect("notify::height", syncOffset);
  syncOffset();
  undo.push(() => boxPointer.disconnect(heightId));
};

const separatePanelHost: SectionHost = {
  attach: (section, { menu }, undo) => {
    const { container, boxPointer } = requireQuickSettingsPopup(menu);
    const panel = new St.BoxLayout({
      style_class: "popup-menu-content quick-settings qsn-notification-panel",
      orientation: Clutter.Orientation.VERTICAL,
    });

    panel.add_child(section);
    container.insert_child_above(panel, boxPointer);
    undo.push(() => panel.destroy());

    followBoxPointer(panel, boxPointer, undo);
    const bindings = ANIMATED_PROPERTIES.map((property) =>
      boxPointer.bind_property(property, panel, property, GObject.BindingFlags.SYNC_CREATE),
    );
    undo.push(() => bindings.forEach((binding) => binding.unbind()));

    return panel;
  },
};

export const SECTION_HOSTS: Record<Placement, SectionHost> = {
  [NotificationPlacement.QUICK_SETTINGS]: quickSettingsGridHost,
  [NotificationPlacement.SEPARATE_PANEL]: separatePanelHost,
};
