/**
 * Liga as features em ordem e desliga na ordem inversa. Uma feature que falha (versão
 * do Shell diferente, outra extensão mexendo no mesmo ator) não derruba as outras.
 */
import { describe, expect, test } from "bun:test";

import type { Feature } from "@domain/feature/feature";
import { FeatureSet, FeaturePhase } from "@service/featureSet";

const makeFeature = (id: string, log: string[], failOn?: "enable" | "disable"): Feature => ({
  id,
  enable: () => {
    if (failOn === "enable") throw new Error(`${id} falhou`);
    log.push(`+${id}`);
  },
  disable: () => {
    if (failOn === "disable") throw new Error(`${id} falhou`);
    log.push(`-${id}`);
  },
});

describe("FeatureSet", () => {
  test("liga em ordem e desliga ao contrário", () => {
    const log: string[] = [];
    const set = new FeatureSet([makeFeature("a", log), makeFeature("b", log)], () => {});

    set.enableAll();
    set.disableAll();

    expect(log).toEqual(["+a", "+b", "-b", "-a"]);
  });

  test("feature que falha ao ligar é reportada e não é desligada depois", () => {
    const log: string[] = [];
    const errors: string[] = [];
    const set = new FeatureSet(
      [makeFeature("a", log), makeFeature("b", log, "enable"), makeFeature("c", log)],
      (id, phase) => errors.push(`${id}:${phase}`),
    );

    set.enableAll();
    set.disableAll();

    expect(errors).toEqual([`b:${FeaturePhase.ENABLE}`]);
    expect(log).toEqual(["+a", "+c", "-c", "-a"]);
  });

  test("falha ao desligar é reportada e os demais continuam", () => {
    const log: string[] = [];
    const errors: string[] = [];
    const set = new FeatureSet(
      [makeFeature("a", log), makeFeature("b", log, "disable")],
      (id, phase) => errors.push(`${id}:${phase}`),
    );

    set.enableAll();
    set.disableAll();

    expect(errors).toEqual([`b:${FeaturePhase.DISABLE}`]);
    expect(log).toEqual(["+a", "+b", "-a"]);
  });

  test("desligar duas vezes não desliga de novo", () => {
    const log: string[] = [];
    const set = new FeatureSet([makeFeature("a", log)], () => {});

    set.enableAll();
    set.disableAll();
    set.disableAll();

    expect(log).toEqual(["+a", "-a"]);
  });

  test("restart reaplica só a feature pedida", () => {
    const log: string[] = [];
    const set = new FeatureSet([makeFeature("a", log), makeFeature("b", log)], () => {});
    set.enableAll();

    set.restart("b");

    expect(log).toEqual(["+a", "+b", "-b", "+b"]);
  });

  test("restart de feature desligada não faz nada", () => {
    const log: string[] = [];
    const set = new FeatureSet([makeFeature("a", log)], () => {});

    set.restart("a");

    expect(log).toEqual([]);
  });
});
