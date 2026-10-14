/**
 * O Clutter mostra todo ator que ganha um pai (`show-on-set-parent`). Ator que estava oculto
 * (subtítulo vazio, seta de menu desligada, indicador sem não lidas) voltava visível ao ser
 * devolvido no desfazer.
 */
import { describe, expect, test } from "bun:test";

import { insertKeepingVisibility } from "@domain/actor/insertKeepingVisibility";

interface FakeActor {
  visible: boolean;
}

/** Imita o Clutter: inserir mostra o filho. */
const makeParent = () => {
  const children: FakeActor[] = [];
  return {
    children,
    insert_child_at_index: (child: FakeActor, index: number) => {
      child.visible = true;
      children.splice(index < 0 ? children.length : index, 0, child);
    },
  };
};

describe("insertKeepingVisibility", () => {
  test("ator oculto continua oculto depois de inserido", () => {
    const parent = makeParent();
    const subtitle = { visible: false };

    insertKeepingVisibility(parent, subtitle, 0);

    expect(subtitle.visible).toBe(false);
    expect(parent.children).toEqual([subtitle]);
  });

  test("ator visível continua visível", () => {
    const parent = makeParent();
    const title = { visible: true };

    insertKeepingVisibility(parent, title, 0);

    expect(title.visible).toBe(true);
  });

  test("sem índice, vai para o fim", () => {
    const parent = makeParent();
    const first = { visible: true };
    const last = { visible: false };
    insertKeepingVisibility(parent, first, 0);

    insertKeepingVisibility(parent, last);

    expect(parent.children).toEqual([first, last]);
  });
});
