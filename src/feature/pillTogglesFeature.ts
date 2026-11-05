import type Clutter from "gi://Clutter";
import type Gio from "gi://Gio";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import type { UndoStack } from "@domain/undo/undoStack";
import { GridItemTracker, readColumnSpan } from "@feature/grid/gridItemTracker";
import { detach, findToggleBodies } from "@feature/toggles/toggleParts";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { requireQuickSettings, type QuickSettingsInternals } from "@infra/gnome/shellInternals";

const PILL_GRID_CLASS = "qsn-pill-grid";

export class PillTogglesFeature extends UndoableFeature {
  readonly id = FeatureId.PILL_TOGGLES;

  constructor(private readonly settings: Gio.Settings) {
    super();
  }

  protected apply(): void {
    if (this.settings.get_boolean(SettingsKey.ROUND_TOGGLES)) return;

    const quickSettings = requireQuickSettings();
    const { grid } = quickSettings;

    grid.add_style_class_name(PILL_GRID_CLASS);
    this.undo.push(() => grid.remove_style_class_name(PILL_GRID_CLASS));

    new GridItemTracker(quickSettings, (item, undo) =>
      removeSubtitle(quickSettings, item, undo),
    ).track(this.undo);
  }
}

const removeSubtitle = (
  quickSettings: QuickSettingsInternals,
  item: Clutter.Actor,
  undo: UndoStack,
): void => {
  if (readColumnSpan(quickSettings, item) >= quickSettings.layout.nColumns) return;

  findToggleBodies(item).forEach((body) => detach(body._subtitle, undo));
};
