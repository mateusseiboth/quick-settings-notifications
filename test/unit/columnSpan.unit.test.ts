/**
 * A grade do Quick Settings passa de 2 para 4 colunas. Só o toggle que ocupava UMA coluna
 * vira redondo; o que ocupava a largura toda (cabeçalho, sliders, "aplicativos em segundo
 * plano", notificações) continua com a largura toda e com o visual original.
 */
import { describe, expect, test } from "bun:test";

import { GridPlacement, resolveGridPlacement } from "@domain/grid/columnSpan";

describe("resolveGridPlacement", () => {
  test("toggle de uma coluna vira redondo e ocupa uma coluna", () => {
    expect(resolveGridPlacement({ isToggle: true, span: 1, from: 2, to: 4 })).toEqual({
      kind: GridPlacement.ROUND_TOGGLE,
      span: 1,
    });
  });

  test("toggle de largura total continua de largura total, sem reestilo", () => {
    expect(resolveGridPlacement({ isToggle: true, span: 2, from: 2, to: 4 })).toEqual({
      kind: GridPlacement.FULL_WIDTH,
      span: 4,
    });
  });

  test("item que não é toggle e ocupava tudo continua ocupando tudo", () => {
    expect(resolveGridPlacement({ isToggle: false, span: 2, from: 2, to: 4 })).toEqual({
      kind: GridPlacement.FULL_WIDTH,
      span: 4,
    });
  });

  test("item parcial que não é toggle escala na proporção", () => {
    expect(resolveGridPlacement({ isToggle: false, span: 1, from: 2, to: 4 })).toEqual({
      kind: GridPlacement.SCALED,
      span: 2,
    });
  });

  test("nunca fica abaixo de 1 coluna", () => {
    expect(resolveGridPlacement({ isToggle: false, span: 0, from: 2, to: 4 }).span).toBe(1);
  });
});
