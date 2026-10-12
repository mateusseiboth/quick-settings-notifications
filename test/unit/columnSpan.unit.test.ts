/**
 * A grade do Quick Settings passa de 2 para 4 colunas: toggle ocupa 1 coluna (redondo),
 * o que era largura total continua largura total, o resto escala na proporção.
 */
import { describe, expect, test } from "bun:test";

import { scaleColumnSpan } from "@domain/grid/columnSpan";

describe("scaleColumnSpan", () => {
  test("toggle ocupa uma coluna", () => {
    expect(scaleColumnSpan({ isToggle: true, span: 1, from: 2, to: 4 })).toBe(1);
    expect(scaleColumnSpan({ isToggle: true, span: 2, from: 2, to: 4 })).toBe(1);
  });

  test("largura total continua largura total", () => {
    expect(scaleColumnSpan({ isToggle: false, span: 2, from: 2, to: 4 })).toBe(4);
  });

  test("item parcial escala na proporção", () => {
    expect(scaleColumnSpan({ isToggle: false, span: 1, from: 2, to: 4 })).toBe(2);
  });

  test("voltar de 4 para 2 colunas", () => {
    expect(scaleColumnSpan({ isToggle: false, span: 4, from: 4, to: 2 })).toBe(2);
    expect(scaleColumnSpan({ isToggle: false, span: 1, from: 4, to: 2 })).toBe(1);
  });

  test("nunca passa do total de colunas nem fica abaixo de 1", () => {
    expect(scaleColumnSpan({ isToggle: false, span: 9, from: 2, to: 4 })).toBe(4);
    expect(scaleColumnSpan({ isToggle: false, span: 0, from: 2, to: 4 })).toBe(1);
  });
});
