import type Clutter from "gi://Clutter";

import { insertKeepingVisibility } from "@domain/actor/insertKeepingVisibility";
import type { UndoStack } from "@domain/undo/undoStack";
import {
  hasMenuToggleInternals,
  hasToggleInternals,
  type MenuToggleInternals,
  type ToggleInternals,
} from "@infra/gnome/shellInternals";

export const detach = (child: Clutter.Actor, undo: UndoStack): void => {
  const parent = child.get_parent();
  if (!parent) return;

  const index = parent.get_children().indexOf(child);
  parent.remove_child(child);
  undo.push(() => insertKeepingVisibility(parent, child, index));
};

export const findToggleBody = (menuToggle: MenuToggleInternals): ToggleInternals | undefined =>
  menuToggle._box.get_children().find(hasToggleInternals);

export const findToggleBodies = (actor: Clutter.Actor): ToggleInternals[] => {
  if (hasToggleInternals(actor)) return [actor];
  if (!hasMenuToggleInternals(actor)) return [];

  const body = findToggleBody(actor);
  return body ? [body] : [];
};
