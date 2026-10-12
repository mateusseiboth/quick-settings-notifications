/**
 * Base das features: o `apply()` registra desfazeres; `disable()` roda todos; se o
 * `apply()` quebrar no meio, o que já foi feito é desfeito antes de o erro subir.
 */
import { describe, expect, test } from "bun:test";

import { UndoableFeature } from "@domain/feature/undoableFeature";

class FakeFeature extends UndoableFeature {
  readonly id = "fake";

  constructor(
    private readonly state: string[],
    private readonly failAfterFirst = false,
  ) {
    super();
  }

  protected apply(): void {
    this.state.push("a");
    this.undo.push(() => this.state.splice(this.state.indexOf("a"), 1));

    if (this.failAfterFirst) throw new Error("Shell diferente");

    this.state.push("b");
    this.undo.push(() => this.state.splice(this.state.indexOf("b"), 1));
  }
}

describe("UndoableFeature", () => {
  test("enable aplica e disable desfaz tudo", () => {
    const state: string[] = [];
    const feature = new FakeFeature(state);

    feature.enable();
    expect(state).toEqual(["a", "b"]);

    feature.disable();
    expect(state).toEqual([]);
  });

  test("falha no meio do apply desfaz o que já foi feito e propaga o erro", () => {
    const state: string[] = [];
    const feature = new FakeFeature(state, true);

    expect(() => feature.enable()).toThrow("Shell diferente");
    expect(state).toEqual([]);
  });
});
