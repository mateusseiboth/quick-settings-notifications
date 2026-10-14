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

  /**
   * O tema crava a altura do toggle em `.quick-toggle, .quick-toggle-has-menu` (uma classe).
   * A regra da pílula fina precisa de mais de uma classe para ganhar.
   */
  test("a pílula fina cobre os dois tipos de toggle e ganha da regra do tema", () => {
    const pill = selectorsOf(buildStylesheet(ThemeVariant.DARK)).filter((selector) =>
      selector.startsWith(".qsn-pill-grid "),
    );

    expect(pill).toContain(".qsn-pill-grid .quick-toggle");
    expect(pill).toContain(".qsn-pill-grid .quick-toggle-has-menu");
  });

  test("a pílula não muda cor: a cor de destaque é a do sistema", () => {
    const css = buildStylesheet(ThemeVariant.DARK);
    const pillRules = [...css.matchAll(/^\.qsn-pill-grid[^{]*\{([^}]*)\}/gm)].map(
      (match) => match[1] ?? "",
    );

    expect(pillRules.length).toBeGreaterThan(0);
    expect(pillRules.filter((rule) => /color/.test(rule))).toEqual([]);
  });

  test("todo seletor começa por uma classe da extensão", () => {
    const selectors = selectorsOf(buildStylesheet(ThemeVariant.DARK));

    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.filter((selector) => !selector.startsWith(".qsn-"))).toEqual([]);
  });
});
