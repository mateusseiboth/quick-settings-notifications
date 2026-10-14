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

  /**
   * Duas features que mexem nos mesmos atores (toggles redondos e em pílula) não podem
   * reiniciar uma de cada vez: o desfazer de uma devolveria o que a outra acabou de tirar.
   */
  test("restartAll desliga todas as pedidas antes de ligar qualquer uma", () => {
    const log: string[] = [];
    const set = new FeatureSet(
      [makeFeature("a", log), makeFeature("b", log), makeFeature("c", log)],
      () => {},
    );
    set.enableAll();

    set.restartAll(["c", "a"]);

    expect(log).toEqual(["+a", "+b", "+c", "-c", "-a", "+a", "+c"]);
  });

  test("restartAll ignora a feature que não estava ligada", () => {
    const log: string[] = [];
    const set = new FeatureSet([makeFeature("a", log), makeFeature("b", log, "enable")], () => {});
    set.enableAll();

    set.restartAll(["a", "b"]);

    expect(log).toEqual(["+a", "-a", "+a"]);
  });

  test("restart de feature desligada não faz nada", () => {
    const log: string[] = [];
    const set = new FeatureSet([makeFeature("a", log)], () => {});

    set.restart("a");

    expect(log).toEqual([]);
  });
});
