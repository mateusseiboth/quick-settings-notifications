/**
 * Pilha de desfazer (padrão Command). Toda alteração feita num ator do Shell registra
 * aqui como voltar atrás; o `disable()` da feature chama `run()`.
 *
 * Um desfazer que falha não pode deixar os outros sem rodar: o Shell ficaria meio
 * alterado até a próxima sessão. Os erros são juntados e sobem no fim.
 */
import { runAll } from "@domain/undo/runAll";

export type Undo = () => void;

export class UndoStack {
  private undos: Undo[] = [];

  get isEmpty(): boolean {
    return this.undos.length === 0;
  }

  push(undo: Undo): void {
    this.undos.push(undo);
  }

  /** Aplica a alteração agora e guarda o desfazer com o que ela devolveu (o valor antigo). */
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
