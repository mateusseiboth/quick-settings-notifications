/**
 * Peças dos toggles nativos que os dois formatos (redondo e pílula) manipulam.
 */
import type Clutter from "gi://Clutter";

import { insertKeepingVisibility } from "@domain/actor/insertKeepingVisibility";
import type { UndoStack } from "@domain/undo/undoStack";
import {
  hasMenuToggleInternals,
  hasToggleInternals,
  type MenuToggleInternals,
  type ToggleInternals,
} from "@infra/gnome/shellInternals";

/** Tira o ator do pai; o desfazer devolve na mesma posição e com a mesma visibilidade. */
export const detach = (child: Clutter.Actor, undo: UndoStack): void => {
  const parent = child.get_parent();
  if (!parent) return;

  const index = parent.get_children().indexOf(child);
  parent.remove_child(child);
  undo.push(() => insertKeepingVisibility(parent, child, index));
};

/** Dentro do `QuickMenuToggle` existe um `QuickToggle` comum com ícone e títulos. */
export const findToggleBody = (menuToggle: MenuToggleInternals): ToggleInternals | undefined =>
  menuToggle._box.get_children().find(hasToggleInternals);

/** O corpo com ícone e títulos: o próprio toggle, ou o de dentro do toggle com menu. */
export const findToggleBodies = (actor: Clutter.Actor): ToggleInternals[] => {
  if (hasToggleInternals(actor)) return [actor];
  if (!hasMenuToggleInternals(actor)) return [];

  const body = findToggleBody(actor);
  return body ? [body] : [];
};
