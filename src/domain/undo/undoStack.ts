import { runAll } from "@domain/undo/runAll";

export type Undo = () => void;

export class UndoStack {
  private undos: Undo[] = [];

  push(undo: Undo): void {
    this.undos.push(undo);
  }

  apply<T>(change: () => T, undo: (previous: T) => void): void {
    const previous = change();
    this.push(() => undo(previous));
  }

  run(): void {
    const pending = this.undos.reverse();
    this.undos = [];
    runAll(pending, "Falha ao desfazer alterações.");
  }
}
