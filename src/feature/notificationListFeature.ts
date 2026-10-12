/**
 * Tira a lista de notificações do calendário e a coloca no fim do Quick Settings.
 *
 * O ator movido é o PRÓPRIO `CalendarMessageList` do Shell, não uma cópia: agrupamento por
 * app, expansão do grupo ao clicar, player de mídia, "Limpar" e o aviso de lista vazia
 * continuam sendo o código nativo. Ao desligar, ele volta para a mesma posição no
 * calendário.
 */
import Clutter from "gi://Clutter";
import St from "gi://St";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { requireDateMenu, requireQuickSettings } from "@infra/gnome/shellInternals";

const COLLAPSE_EVENTS = [
  "captured-event::button",
  "captured-event::touch",
  "captured-event::key",
] as const;

export class NotificationListFeature extends UndoableFeature {
  readonly id = FeatureId.NOTIFICATION_LIST;

  protected apply(): void {
    const { _messageList: messageList } = requireDateMenu();
    const { menu, layout } = requireQuickSettings();

    const section = new St.BoxLayout({
      style_class: "qsn-notifications",
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });
    menu.addItem(section, layout.nColumns);
    this.undo.push(() => section.destroy());

    this.moveIntoSection(messageList, section);
    this.collapseGroupsOnOutsideClick(menu.actor, (event) =>
      messageList.maybeCollapseMessageGroupForEvent(event),
    );
  }

  private moveIntoSection(messageList: St.Widget, section: St.BoxLayout): void {
    const calendarArea = messageList.get_parent();
    if (!calendarArea) throw new Error("A lista de notificações não está no calendário.");

    const index = calendarArea.get_children().indexOf(messageList);
    calendarArea.remove_child(messageList);
    section.add_child(messageList);

    this.undo.push(() => {
      section.remove_child(messageList);
      calendarArea.insert_child_at_index(messageList, index);
    });
  }

  /** O calendário faz o mesmo: clique fora do grupo expandido recolhe o grupo. */
  private collapseGroupsOnOutsideClick(
    menuActor: Clutter.Actor,
    collapse: (event: Clutter.Event) => boolean,
  ): void {
    const ids = COLLAPSE_EVENTS.map((signal) =>
      menuActor.connect(signal, (_actor: Clutter.Actor, event: Clutter.Event) => collapse(event)),
    );
    this.undo.push(() => ids.forEach((id) => menuActor.disconnect(id)));
  }
}
