import type Clutter from "gi://Clutter";
import Meta from "gi://Meta";

import { runAll } from "@domain/undo/runAll";
import { UndoStack } from "@domain/undo/undoStack";
import type { QuickSettingsInternals } from "@infra/gnome/shellInternals";

export type ConvertGridItem = (item: Clutter.Actor, undo: UndoStack) => void;

export class GridItemTracker {
  private readonly itemUndos = new Map<Clutter.Actor, UndoStack>();

  constructor(
    private readonly quickSettings: QuickSettingsInternals,
    private readonly convert: ConvertGridItem,
  ) {}

  track(undo: UndoStack): void {
    undo.push(() => this.undoAllItems());
    this.quickSettings.grid.get_children().forEach((item) => this.convertItem(item));
    this.watchNewItems(undo);
  }

  private watchNewItems(undo: UndoStack): void {
    const { grid } = this.quickSettings;
    const laters = global.compositor.get_laters();
    const pending = new Set<number>();

    const childAddedId = grid.connect("child-added", (_grid, item: Clutter.Actor) => {
      const laterId = laters.add(Meta.LaterType.BEFORE_REDRAW, () => {
        pending.delete(laterId);
        this.convertItem(item);
        return false;
      });
      pending.add(laterId);
    });

    undo.push(() => {
      grid.disconnect(childAddedId);
      pending.forEach((laterId) => laters.remove(laterId));
    });
  }

  private convertItem(item: Clutter.Actor): void {
    const { grid, layout } = this.quickSettings;
    if (item === layout._overlay || this.itemUndos.has(item) || item.get_parent() !== grid) return;

    const undo = new UndoStack();
    this.itemUndos.set(item, undo);
    const destroyId = item.connect("destroy", () => this.itemUndos.delete(item));
    undo.push(() => item.disconnect(destroyId));

    this.convert(item, undo);
  }

  private undoAllItems(): void {
    const stacks = [...this.itemUndos.values()];
    this.itemUndos.clear();
    runAll(
      stacks.map((stack) => () => stack.run()),
      "Falha ao restaurar toggles.",
    );
  }
}

export const readColumnSpan = ({ grid, layout }: QuickSettingsInternals, item: Clutter.Actor) =>
  (layout.get_child_meta(grid, item) as Clutter.LayoutMeta & { column_span: number }).column_span;
