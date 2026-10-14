/**
 * Onde a seção de notificações é colocada (strategy por `NotificationPlacement`):
 *
 *   Quick Settings   item de largura total no fim da grade
 *   Painel separado  cartão próprio logo abaixo do cartão do Quick Settings
 *
 * O painel separado é filho do `menu.actor`, irmão do `BoxPointer`: aparece e some com o
 * menu, fica no mesmo grupo de foco, e o clique nele não fecha o menu. Ele usa as MESMAS
 * classes do cartão do Quick Settings (`popup-menu-content quick-settings`), então fundo,
 * borda, sombra e recuo vêm do tema em uso. Posição e largura seguem o `BoxPointer` por
 * restrição (`followBoxPointer`); opacidade e deslocamento acompanham a animação de abrir e fechar.
 *
 * Cada estratégia devolve o ator que aparece e some junto com a lista.
 */
import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import St from "gi://St";

import {
  NotificationPlacement,
  resolveSeparatePanelOffset,
  type NotificationPlacement as Placement,
} from "@domain/notification/notificationPlacement";
import type { UndoStack } from "@domain/undo/undoStack";
import {
  requireQuickSettingsPopup,
  type QuickSettingsInternals,
} from "@infra/gnome/shellInternals";

export interface SectionHost {
  attach(section: St.BoxLayout, quickSettings: QuickSettingsInternals, undo: UndoStack): St.Widget;
}

/** Espaço entre o Quick Settings e o painel de notificações, em pixels lógicos. */
const PANEL_GAP = 12;

/** Propriedades da animação do `BoxPointer` que o painel copia. */
const ANIMATED_PROPERTIES = ["opacity", "translation-y"] as const;

const quickSettingsGridHost: SectionHost = {
  attach: (section, { menu, layout }, undo) => {
    menu.addItem(section, layout.nColumns);
    undo.push(() => section.destroy());
    return section;
  },
};

/**
 * Prende o painel logo abaixo do `BoxPointer`: mesmo X e mesma largura, e Y = Y do
 * `BoxPointer` + altura dele + espaço. O deslocamento acompanha a altura, que muda quando um
 * submenu abre. `SnapConstraint` NÃO serve: ele só move a borda de cima do painel, e o
 * painel ficava esmagado com a altura de uma linha.
 */
const followBoxPointer = (panel: St.Widget, boxPointer: St.Widget, undo: UndoStack): void => {
  const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
  const below = new Clutter.BindConstraint({
    source: boxPointer,
    coordinate: Clutter.BindCoordinate.Y,
  });
  const syncOffset = () =>
    (below.offset = resolveSeparatePanelOffset({
      quickSettingsHeight: boxPointer.height,
      gap: PANEL_GAP,
      scale,
    }));

  panel.add_constraint(
    new Clutter.BindConstraint({ source: boxPointer, coordinate: Clutter.BindCoordinate.X }),
  );
  panel.add_constraint(below);
  panel.add_constraint(
    new Clutter.BindConstraint({ source: boxPointer, coordinate: Clutter.BindCoordinate.WIDTH }),
  );

  const heightId = boxPointer.connect("notify::height", syncOffset);
  syncOffset();
  undo.push(() => boxPointer.disconnect(heightId));
};

const separatePanelHost: SectionHost = {
  attach: (section, { menu }, undo) => {
    const { container, boxPointer } = requireQuickSettingsPopup(menu);
    const panel = new St.BoxLayout({
      style_class: "popup-menu-content quick-settings qsn-notification-panel",
      orientation: Clutter.Orientation.VERTICAL,
    });

    panel.add_child(section);
    container.insert_child_above(panel, boxPointer);
    undo.push(() => panel.destroy());

    followBoxPointer(panel, boxPointer, undo);
    const bindings = ANIMATED_PROPERTIES.map((property) =>
      boxPointer.bind_property(property, panel, property, GObject.BindingFlags.SYNC_CREATE),
    );
    undo.push(() => bindings.forEach((binding) => binding.unbind()));

    return panel;
  },
};

export const SECTION_HOSTS: Record<Placement, SectionHost> = {
  [NotificationPlacement.QUICK_SETTINGS]: quickSettingsGridHost,
  [NotificationPlacement.SEPARATE_PANEL]: separatePanelHost,
};
