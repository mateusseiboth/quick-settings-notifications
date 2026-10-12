/**
 * Roda todas as ações mesmo que alguma falhe; os erros sobem juntos no fim.
 */
import { describe, expect, test } from "bun:test";

import { runAll } from "@domain/undo/runAll";

describe("runAll", () => {
  test("roda tudo na ordem dada", () => {
    const calls: number[] = [];

    runAll([() => calls.push(1), () => calls.push(2)], "falhou");

    expect(calls).toEqual([1, 2]);
  });

  test("continua depois de uma falha e junta os erros", () => {
    const calls: number[] = [];
    const run = () =>
      runAll(
        [
          () => {
            throw new Error("um");
          },
          () => calls.push(2),
          () => {
            throw new Error("três");
          },
        ],
        "falhou",
      );

    expect(run).toThrow(AggregateError);
    expect(calls).toEqual([2]);
    try {
      run();
    } catch (error) {
      expect((error as AggregateError).errors).toHaveLength(2);
      expect((error as AggregateError).message).toBe("falhou");
    }
  });
});
