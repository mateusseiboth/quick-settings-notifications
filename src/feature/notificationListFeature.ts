/**
 * Tira a lista de notificações do calendário e a coloca no fim do Quick Settings, ou num
 * painel separado logo abaixo dele (preferência; ver `SECTION_HOSTS`).
 *
 * O ator movido é o PRÓPRIO `CalendarMessageList` do Shell, não uma cópia: agrupamento por
 * app, expansão do grupo ao clicar, player de mídia e "Limpar" continuam sendo o código
 * nativo. Lista vazia esconde a seção inteira, e o "Limpar" vai para a direita. Ao
 * desligar, a lista volta para a mesma posição no calendário.
 */
import Clutter from "gi://Clutter";
import type Gio from "gi://Gio";
import St from "gi://St";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { resolveNotificationPlacement } from "@domain/notification/notificationPlacement";
import { isNotificationSectionVisible } from "@domain/notification/notificationVisibility";
import { SECTION_HOSTS } from "@feature/notificationList/sectionHosts";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import {
  requireDateMenu,
  requireQuickSettings,
  type MessageListInternals,
} from "@infra/gnome/shellInternals";

const COLLAPSE_EVENTS = [
  "captured-event::button",
  "captured-event::touch",
  "captured-event::key",
] as const;

export class NotificationListFeature extends UndoableFeature {
  readonly id = FeatureId.NOTIFICATION_LIST;

  constructor(private readonly settings: Gio.Settings) {
    super();
  }

  protected apply(): void {
    const { _messageList: messageList } = requireDateMenu();
    const quickSettings = requireQuickSettings();
    const { menu } = quickSettings;

    const section = new St.BoxLayout({
      style_class: "qsn-notifications",
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });
    const placement = resolveNotificationPlacement({
      isSeparatePanel: this.settings.get_boolean(SettingsKey.SEPARATE_NOTIFICATION_PANEL),
    });
    const host = SECTION_HOSTS[placement].attach(section, quickSettings, this.undo);

    this.moveIntoSection(messageList, section);
    this.removeCalendarSpacing(messageList);
    this.hideWhenEmpty(messageList, host);
    this.alignClearButtonRight(messageList);
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

  /**
   * No calendário a lista tem margem, recuo e borda à direita (`.message-list:ltr`) e o
   * `MessageView` reserva 12px para a barra de rolagem (`.message-view:ltr`). No Quick
   * Settings isso vira um vão à direita do cartão. Estilo INLINE porque a regra do tema
   * venceu a da folha da extensão.
   */
  private removeCalendarSpacing(messageList: MessageListInternals): void {
    this.setInlineStyle(messageList, "margin: 0; padding: 0; border-width: 0;");
    this.setInlineStyle(messageList._messageView, "margin: 0;");

    const controls = messageList._clearButton.get_parent();
    if (controls instanceof St.Widget) this.setInlineStyle(controls, "padding: 6px 0 0 0;");
  }

  private setInlineStyle(widget: St.Widget, style: string): void {
    this.undo.apply(
      () => {
        const previous = widget.get_style();
        widget.set_style(style);
        return previous;
      },
      (previous) => widget.set_style(previous),
    );
  }

  /** `host` é a seção (na grade) ou o painel separado inteiro. */
  private hideWhenEmpty(messageList: MessageListInternals, host: St.Widget): void {
    const view = messageList._messageView;
    const sync = () => (host.visible = isNotificationSectionVisible({ isEmpty: view.empty }));

    const id = view.connect("notify::empty", sync);
    sync();
    this.undo.push(() => view.disconnect(id));
  }

  private alignClearButtonRight(messageList: MessageListInternals): void {
    const button = messageList._clearButton;
    this.undo.apply(
      () => {
        const previous = button.x_align;
        button.x_align = Clutter.ActorAlign.END;
        return previous;
      },
      (previous) => (button.x_align = previous),
    );
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
