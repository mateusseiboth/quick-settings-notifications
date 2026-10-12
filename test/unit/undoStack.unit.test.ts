/**
 * Pilha de desfazer usada por toda feature que mexe em ator do Shell: cada alteração
 * registra o seu desfazer, e o `disable()` roda tudo em ordem inversa.
 */
import { describe, expect, test } from "bun:test";

import { UndoStack } from "@domain/undo/undoStack";

describe("UndoStack", () => {
  test("desfaz na ordem inversa do registro", () => {
    const calls: string[] = [];
    const stack = new UndoStack();

    stack.push(() => calls.push("primeiro"));
    stack.push(() => calls.push("segundo"));
    stack.run();

    expect(calls).toEqual(["segundo", "primeiro"]);
  });

  test("esvazia depois de rodar (rodar de novo não repete)", () => {
    let count = 0;
    const stack = new UndoStack();
    stack.push(() => count++);

    stack.run();
    stack.run();

    expect(count).toBe(1);
  });

  test("apply aplica agora e registra o desfazer com o valor anterior", () => {
    const state = { columns: 2 };
    const stack = new UndoStack();

    stack.apply(
      () => {
        const previous = state.columns;
        state.columns = 4;
        return previous;
      },
      (previous) => (state.columns = previous),
    );
    expect(state.columns).toBe(4);

    stack.run();
    expect(state.columns).toBe(2);
  });

  test("um desfazer que falha não impede os outros, e o erro sobe no fim", () => {
    const calls: string[] = [];
    const stack = new UndoStack();
    stack.push(() => calls.push("a"));
    stack.push(() => {
      throw new Error("quebrou");
    });
    stack.push(() => calls.push("c"));

    expect(() => stack.run()).toThrow(AggregateError);
    expect(calls).toEqual(["c", "a"]);
  });

  test("informa se há algo para desfazer", () => {
    const stack = new UndoStack();
    expect(stack.isEmpty).toBe(true);

    stack.push(() => {});
    expect(stack.isEmpty).toBe(false);
  });
});
