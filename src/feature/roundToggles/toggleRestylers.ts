/**
 * Reestilo de cada tipo de toggle para o formato redondo (strategy por tipo):
 *
 *        ( ícone )        círculo clicável: liga e desliga, como antes
 *        Título ▾         só nos toggles com menu: abre o menu, como a seta de antes
 *
 * Tudo o que é alterado registra o desfazer na `UndoStack` recebida. As classes do tema
 * (`quick-toggle`, `button`, `quick-toggle-has-menu`) saem enquanto a extensão está
 * ativa, para que o visual de pílula do tema não dispute com o CSS da extensão.
 */
import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import St from "gi://St";

import type { UndoStack } from "@domain/undo/undoStack";
import {
  hasMenuToggleInternals,
  hasToggleInternals,
  type MenuToggleInternals,
  type ToggleInternals,
} from "@infra/gnome/shellInternals";

export interface ToggleRestyler {
  matches(actor: Clutter.Actor): boolean;
  apply(actor: Clutter.Actor, undo: UndoStack): void;
}

const THEME_TOGGLE_CLASSES = ["quick-toggle", "button"];
const THEME_MENU_TOGGLE_CLASSES = ["quick-toggle-has-menu"];

const swapStyleClasses = (
  actor: St.Widget,
  remove: readonly string[],
  add: string,
  undo: UndoStack,
): void => {
  const removed = remove.filter((name) => actor.has_style_class_name(name));
  removed.forEach((name) => actor.remove_style_class_name(name));
  actor.add_style_class_name(add);

  undo.push(() => {
    actor.remove_style_class_name(add);
    removed.forEach((name) => actor.add_style_class_name(name));
  });
};

const addStyleClass = (actor: St.Widget, name: string, undo: UndoStack): void => {
  actor.add_style_class_name(name);
  undo.push(() => actor.remove_style_class_name(name));
};

const setProperty = <A extends object, K extends keyof A>(
  target: A,
  key: K,
  value: A[K],
  undo: UndoStack,
): void =>
  undo.apply(
    () => {
      const previous = target[key];
      target[key] = value;
      return previous;
    },
    (previous) => (target[key] = previous),
  );

const detach = (child: Clutter.Actor, undo: UndoStack): void => {
  const parent = child.get_parent();
  if (!parent) return;

  const index = parent.get_children().indexOf(child);
  parent.remove_child(child);
  undo.push(() => parent.insert_child_at_index(child, index));
};

/** Ícone vira círculo, título centralizado embaixo, subtítulo sai (não cabe em 4 colunas). */
const restyleToggleBody = (toggle: ToggleInternals, undo: UndoStack): void => {
  swapStyleClasses(toggle, THEME_TOGGLE_CLASSES, "qsn-round-toggle", undo);

  setProperty(toggle._box, "orientation", Clutter.Orientation.VERTICAL, undo);
  addStyleClass(toggle._box, "qsn-round-box", undo);

  addStyleClass(toggle._icon, "qsn-round-icon", undo);
  setProperty(toggle._icon, "x_align", Clutter.ActorAlign.CENTER, undo);
  setProperty(toggle._icon, "x_expand", false, undo);

  const titleBox = toggle._title.get_parent();
  if (titleBox) setProperty(titleBox, "x_align", Clutter.ActorAlign.CENTER, undo);

  addStyleClass(toggle._title, "qsn-round-title", undo);
  setProperty(toggle._title, "x_align", Clutter.ActorAlign.CENTER, undo);

  detach(toggle._subtitle, undo);
};

/** Troca o título por um botão "Título ▾" que abre o menu do toggle. */
const replaceTitleWithMenuLabel = (
  menuToggle: MenuToggleInternals,
  body: ToggleInternals,
  undo: UndoStack,
): void => {
  const title = body._title;
  const titleBox = title.get_parent();
  if (!titleBox) return;

  const arrow = new St.Icon({
    icon_name: "pan-down-symbolic",
    style_class: "qsn-round-arrow",
    y_align: Clutter.ActorAlign.CENTER,
  });
  const labelBox = new St.BoxLayout({ style_class: "qsn-round-label-box" });
  const labelButton = new St.Button({
    style_class: "qsn-round-label",
    child: labelBox,
    can_focus: true,
    x_align: Clutter.ActorAlign.CENTER,
    accessible_name: title.text,
  });

  setProperty(title, "x_expand", false, undo);
  titleBox.remove_child(title);
  labelBox.add_child(title);
  labelBox.add_child(arrow);
  titleBox.insert_child_at_index(labelButton, 0);

  const binding = menuToggle.bind_property(
    "menu-enabled",
    arrow,
    "visible",
    GObject.BindingFlags.SYNC_CREATE,
  );
  labelButton.connect("clicked", () => {
    if (menuToggle.menuEnabled) menuToggle.menu.open();
  });

  undo.push(() => {
    binding.unbind();
    labelBox.remove_child(title);
    labelButton.destroy();
    titleBox.insert_child_at_index(title, 0);
  });
};

const plainToggleRestyler: ToggleRestyler = {
  matches: (actor) => hasToggleInternals(actor),
  apply: (actor, undo) => restyleToggleBody(actor as ToggleInternals, undo),
};

const menuToggleRestyler: ToggleRestyler = {
  matches: (actor) => hasMenuToggleInternals(actor) && !!findToggleBody(actor),
  apply: (actor, undo) => {
    const menuToggle = actor as MenuToggleInternals;
    const body = findToggleBody(menuToggle)!;

    swapStyleClasses(menuToggle, THEME_MENU_TOGGLE_CLASSES, "qsn-round-menu-toggle", undo);
    restyleToggleBody(body, undo);

    const separator = menuToggle._menuButton.get_previous_sibling();
    if (separator && separator !== body) detach(separator, undo);
    detach(menuToggle._menuButton, undo);

    replaceTitleWithMenuLabel(menuToggle, body, undo);
  },
};

/** Dentro do `QuickMenuToggle` existe um `QuickToggle` comum com ícone e títulos. */
const findToggleBody = (menuToggle: MenuToggleInternals): ToggleInternals | undefined =>
  menuToggle._box.get_children().find(hasToggleInternals);

/** Ordem importa: o toggle com menu também tem `_box`, então é testado primeiro. */
export const TOGGLE_RESTYLERS: readonly ToggleRestyler[] = [
  menuToggleRestyler,
  plainToggleRestyler,
];

export const isQuickToggle = (actor: Clutter.Actor): boolean =>
  TOGGLE_RESTYLERS.some((restyler) => restyler.matches(actor));
