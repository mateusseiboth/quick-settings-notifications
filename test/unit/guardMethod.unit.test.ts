/**
 * Protege um método de uma instância do Shell: a chamada só chega ao original quando o
 * guarda permite. É o que evita o `MessageTray` do Shell 51 reabrir um aviso que está
 * sumindo (ver doc/integracao-gnome.md).
 */
import { describe, expect, test } from "bun:test";

import { guardMethod } from "@domain/patch/guardMethod";

class Tray {
  hiding = false;
  calls: string[] = [];

  update(label: string): void {
    this.calls.push(label);
  }
}

describe("guardMethod", () => {
  test("chama o original com os mesmos argumentos quando o guarda permite", () => {
    const tray = new Tray();
    guardMethod(tray, "update", (target) => !target.hiding);

    tray.update("novo");

    expect(tray.calls).toEqual(["novo"]);
  });

  test("não chama o original quando o guarda recusa", () => {
    const tray = new Tray();
    guardMethod(tray, "update", (target) => !target.hiding);

    tray.hiding = true;
    tray.update("durante o sumiço");

    expect(tray.calls).toEqual([]);
  });

  test("o restaurar devolve o método do protótipo, sem deixar propriedade na instância", () => {
    const tray = new Tray();
    const restore = guardMethod(tray, "update", () => false);

    restore();
    tray.update("depois");

    expect(tray.calls).toEqual(["depois"]);
    expect(Object.hasOwn(tray, "update")).toBe(false);
  });

  test("o restaurar devolve o método próprio que a instância já tinha", () => {
    const calls: string[] = [];
    const own = { update: (label: string) => calls.push(`próprio ${label}`) };
    const restore = guardMethod(own, "update", () => false);

    restore();
    own.update("x");

    expect(calls).toEqual(["próprio x"]);
  });
});
