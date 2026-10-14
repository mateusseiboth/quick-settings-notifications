/**
 * Grade do Quick Settings com 4 colunas e toggles redondos (mockup "Quick Toggles" do
 * GNOME Design). Sliders, cabeçalho e notificações continuam com a largura total. Itens
 * que entram depois também são convertidos (`GridItemTracker`).
 */
import type Clutter from "gi://Clutter";
import type Gio from "gi://Gio";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { GridPlacement, ROUND_TOGGLE_COLUMNS, resolveGridPlacement } from "@domain/grid/columnSpan";
import type { UndoStack } from "@domain/undo/undoStack";
import { GridItemTracker, readColumnSpan } from "@feature/grid/gridItemTracker";
import { isQuickToggle, TOGGLE_RESTYLERS } from "@feature/roundToggles/toggleRestylers";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { requireQuickSettings, type QuickSettingsInternals } from "@infra/gnome/shellInternals";

export class RoundTogglesFeature extends UndoableFeature {
  readonly id = FeatureId.ROUND_TOGGLES;

  constructor(private readonly settings: Gio.Settings) {
    super();
  }

  protected apply(): void {
    if (!this.settings.get_boolean(SettingsKey.ROUND_TOGGLES)) return;

    const quickSettings = requireQuickSettings();
    const { grid, layout } = quickSettings;
    const originalColumns = layout.nColumns;

    this.undo.apply(
      () => {
        layout.nColumns = ROUND_TOGGLE_COLUMNS;
        return originalColumns;
      },
      (previous) => (layout.nColumns = previous),
    );

    grid.add_style_class_name("qsn-round-grid");
    this.undo.push(() => grid.remove_style_class_name("qsn-round-grid"));

    new GridItemTracker(quickSettings, (item, undo) =>
      convertItem(quickSettings, item, originalColumns, undo),
    ).track(this.undo);
  }
}

const convertItem = (
  quickSettings: QuickSettingsInternals,
  item: Clutter.Actor,
  originalColumns: number,
  undo: UndoStack,
): void => {
  const { grid, layout } = quickSettings;
  const placement = resolveGridPlacement({
    isToggle: isQuickToggle(item),
    span: readColumnSpan(quickSettings, item),
    from: originalColumns,
    to: ROUND_TOGGLE_COLUMNS,
  });

  undo.apply(
    () => {
      const previous = readColumnSpan(quickSettings, item);
      layout.child_set_property(grid, item, "column-span", placement.span);
      return previous;
    },
    (previous) => layout.child_set_property(grid, item, "column-span", previous),
  );

  if (placement.kind !== GridPlacement.ROUND_TOGGLE) return;
  TOGGLE_RESTYLERS.find((restyler) => restyler.matches(item))?.apply(item, undo);
};
