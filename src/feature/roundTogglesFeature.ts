/**
 * Grade do Quick Settings com 4 colunas e toggles redondos (mockup "Quick Toggles" do
 * GNOME Design). Sliders, cabeçalho e notificações continuam com a largura total.
 *
 * Itens adicionados DEPOIS (outra extensão ligando) também são convertidos. O ajuste
 * espera o próximo quadro porque o `QuickSettingsMenu.addItem` adiciona o ator à grade
 * antes de gravar o `column-span` dele: aplicar no `child-added` seria sobrescrito.
 *
 * Cada item tem a própria pilha de desfazer: se ele for destruído antes (a extensão dona
 * desligou), a pilha é descartada em vez de tentar mexer num ator morto.
 */
import type Clutter from "gi://Clutter";
import type Gio from "gi://Gio";
import Meta from "gi://Meta";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { GridPlacement, ROUND_TOGGLE_COLUMNS, resolveGridPlacement } from "@domain/grid/columnSpan";
import { runAll } from "@domain/undo/runAll";
import { UndoStack } from "@domain/undo/undoStack";
import { isQuickToggle, TOGGLE_RESTYLERS } from "@feature/roundToggles/toggleRestylers";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { requireQuickSettings, type QuickSettingsInternals } from "@infra/gnome/shellInternals";

export class RoundTogglesFeature extends UndoableFeature {
  readonly id = FeatureId.ROUND_TOGGLES;
  private readonly itemUndos = new Map<Clutter.Actor, UndoStack>();

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

    this.undo.push(() => this.undoAllItems());
    grid.get_children().forEach((item) => this.convertItem(quickSettings, item, originalColumns));
    this.watchNewItems(quickSettings, originalColumns);
  }

  private watchNewItems(quickSettings: QuickSettingsInternals, originalColumns: number): void {
    const laters = global.compositor.get_laters();
    const pending = new Set<number>();

    const childAddedId = quickSettings.grid.connect("child-added", (_grid, item: Clutter.Actor) => {
      const laterId = laters.add(Meta.LaterType.BEFORE_REDRAW, () => {
        pending.delete(laterId);
        this.convertItem(quickSettings, item, originalColumns);
        return false;
      });
      pending.add(laterId);
    });

    this.undo.push(() => {
      quickSettings.grid.disconnect(childAddedId);
      pending.forEach((laterId) => laters.remove(laterId));
    });
  }

  private convertItem(
    quickSettings: QuickSettingsInternals,
    item: Clutter.Actor,
    originalColumns: number,
  ): void {
    const { grid, layout } = quickSettings;
    if (item === layout._overlay || this.itemUndos.has(item) || item.get_parent() !== grid) return;

    const undo = new UndoStack();
    this.itemUndos.set(item, undo);
    const destroyId = item.connect("destroy", () => this.itemUndos.delete(item));
    undo.push(() => item.disconnect(destroyId));

    const meta = layout.get_child_meta(grid, item) as Clutter.LayoutMeta & { column_span: number };
    const placement = resolveGridPlacement({
      isToggle: isQuickToggle(item),
      span: meta.column_span,
      from: originalColumns,
      to: ROUND_TOGGLE_COLUMNS,
    });

    undo.apply(
      () => {
        const previous = meta.column_span;
        layout.child_set_property(grid, item, "column-span", placement.span);
        return previous;
      },
      (previous) => layout.child_set_property(grid, item, "column-span", previous),
    );

    if (placement.kind !== GridPlacement.ROUND_TOGGLE) return;
    TOGGLE_RESTYLERS.find((restyler) => restyler.matches(item))?.apply(item, undo);
  }

  /** Um item que falhe ao desfazer não pode deixar os outros convertidos. */
  private undoAllItems(): void {
    const stacks = [...this.itemUndos.values()];
    this.itemUndos.clear();
    runAll(
      stacks.map((stack) => () => stack.run()),
      "Falha ao restaurar toggles.",
    );
  }
}
