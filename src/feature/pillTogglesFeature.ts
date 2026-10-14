/**
 * Toggles em pílula FINA (mockup "Quick Toggles"), quando o formato redondo está desligado.
 *
 * O toggle continua o nativo, com as classes e as cores do tema (o ligado usa a cor de
 * destaque do sistema). Duas mudanças:
 *
 * - a grade ganha `qsn-pill-grid`, cuja regra baixa a altura mínima do toggle;
 * - o subtítulo sai dos toggles de UMA coluna. Uma linha a mais num toggle deixava a linha
 *   inteira da grade mais alta. O detalhe (rede, modo de energia) continua no menu dele.
 *
 * Itens que ocupam a largura toda ficam como estão, igual ao formato redondo.
 */
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
