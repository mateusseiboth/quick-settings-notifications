import type Gio from "gi://Gio";
import type St from "gi://St";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { resolveTopBarLook, type TopBarLook } from "@domain/panel/topBarStyle";
import type { UndoStack } from "@domain/undo/undoStack";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { requireTopBar, type TopBarInternals } from "@infra/gnome/shellInternals";

const TRANSPARENT_CLASS = "qsn-transparent-top-bar";
const ZONE_CLASS = "qsn-top-bar-zone";

interface TopBarChange {
  isWanted(look: TopBarLook): boolean;
  apply(topBar: TopBarInternals, undo: UndoStack): void;
}

const addStyleClass = (actor: St.Widget, className: string, undo: UndoStack): void => {
  actor.add_style_class_name(className);
  undo.push(() => actor.remove_style_class_name(className));
};

const clearBackground: TopBarChange = {
  isWanted: (look) => look.isTransparent,
  apply: ({ panel }, undo) => addStyleClass(panel, TRANSPARENT_CLASS, undo),
};

const badgeZones: TopBarChange = {
  isWanted: (look) => look.hasZoneBadges,
  apply: ({ zones }, undo) => zones.forEach((zone) => addStyleClass(zone, ZONE_CLASS, undo)),
};

const TOP_BAR_CHANGES: readonly TopBarChange[] = [clearBackground, badgeZones];

export class TopBarStyleFeature extends UndoableFeature {
  readonly id = FeatureId.TOP_BAR_STYLE;

  constructor(private readonly settings: Gio.Settings) {
    super();
  }

  protected apply(): void {
    const look = resolveTopBarLook(this.settings.get_string(SettingsKey.TOP_BAR_STYLE));
    const changes = TOP_BAR_CHANGES.filter((change) => change.isWanted(look));
    if (changes.length === 0) return;

    const topBar = requireTopBar();
    changes.forEach((change) => change.apply(topBar, this.undo));
  }
}
