/**
 * Base das features que alteram atores do Shell: cada alteração do `apply()` registra o
 * seu desfazer em `this.undo`. Falha no meio do `apply()` desfaz o que já foi feito.
 */
import type { Feature } from "@domain/feature/feature";
import { UndoStack } from "@domain/undo/undoStack";

export abstract class UndoableFeature implements Feature {
  abstract readonly id: string;
  protected readonly undo = new UndoStack();

  enable(): void {
    try {
      this.apply();
    } catch (error) {
      this.undo.run();
      throw error;
    }
  }

  disable(): void {
    this.undo.run();
  }

  protected abstract apply(): void;
}
