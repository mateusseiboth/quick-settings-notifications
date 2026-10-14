/**
 * Estilo da barra superior escolhido nas preferências: normal, transparente, ou
 * transparente com fundo em cada zona (atividades, relógio, ícones e Quick Settings).
 */
import { describe, expect, test } from "bun:test";

import { resolveTopBarLook, TopBarStyle } from "@domain/panel/topBarStyle";

describe("resolveTopBarLook", () => {
  test("normal não mexe na barra", () => {
    expect(resolveTopBarLook(TopBarStyle.DEFAULT)).toEqual({
      isTransparent: false,
      hasZoneBadges: false,
    });
  });

  test("transparente tira só o fundo", () => {
    expect(resolveTopBarLook(TopBarStyle.TRANSPARENT)).toEqual({
      isTransparent: true,
      hasZoneBadges: false,
    });
  });

  test("transparente com zonas tira o fundo e põe um fundo em volta de cada zona", () => {
    expect(resolveTopBarLook(TopBarStyle.TRANSPARENT_ZONES)).toEqual({
      isTransparent: true,
      hasZoneBadges: true,
    });
  });

  test("valor desconhecido cai no normal", () => {
    expect(resolveTopBarLook("blur")).toEqual(resolveTopBarLook(TopBarStyle.DEFAULT));
  });
});
