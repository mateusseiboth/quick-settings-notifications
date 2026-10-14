/**
 * CSS claro e escuro do mesmo molde; toda regra fica presa a uma classe da extensão
 * para não vazar para o resto do Shell.
 */
import { describe, expect, test } from "bun:test";

import { buildStylesheet, ThemeVariant } from "@style/stylesheet";

const selectorsOf = (css: string): string[] =>
  [...css.matchAll(/^([^{\n]+)\{/gm)].flatMap((match) =>
    (match[1] ?? "").split(",").map((s) => s.trim()),
  );

describe("buildStylesheet", () => {
  test("gera as duas variantes com as mesmas regras", () => {
    const dark = buildStylesheet(ThemeVariant.DARK);
    const light = buildStylesheet(ThemeVariant.LIGHT);

    expect(selectorsOf(dark)).toEqual(selectorsOf(light));
    expect(dark).not.toBe(light);
  });

  test("não sobra token sem substituir", () => {
    for (const variant of Object.values(ThemeVariant)) {
      expect(buildStylesheet(variant)).not.toMatch(/\{\{/);
    }
  });

  test("as zonas da barra superior ganham fundo arredondado", () => {
    expect(selectorsOf(buildStylesheet(ThemeVariant.DARK))).toContain(".qsn-top-bar-zone");
  });

  test("todo seletor começa por uma classe da extensão", () => {
    const selectors = selectorsOf(buildStylesheet(ThemeVariant.DARK));

    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.filter((selector) => !selector.startsWith(".qsn-"))).toEqual([]);
  });
});
