import Clutter from "gi://Clutter";
import type Gio from "gi://Gio";
import St from "gi://St";

import { insertKeepingVisibility } from "@domain/actor/insertKeepingVisibility";
import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { resolveNotificationPlacement } from "@domain/notification/notificationPlacement";
import { GROUP_COLLAPSERS } from "@feature/notificationList/groupCollapsers";
import { SECTION_HOSTS } from "@feature/notificationList/sectionHosts";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import {
  requireDateMenu,
  requireQuickSettings,
  ShellShapeError,
  type MessageListInternals,
} from "@infra/gnome/shellInternals";

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
    this.collapseGroupsOnOutsideClick(messageList, menu.actor);
  }

  private moveIntoSection(messageList: St.Widget, section: St.BoxLayout): void {
    const calendarArea = messageList.get_parent();
    if (!calendarArea) throw new Error("A lista de notificações não está no calendário.");

    const index = calendarArea.get_children().indexOf(messageList);
    calendarArea.remove_child(messageList);
    insertKeepingVisibility(section, messageList);

    this.undo.push(() => {
      section.remove_child(messageList);
      insertKeepingVisibility(calendarArea, messageList, index);
    });
  }

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

  private hideWhenEmpty(messageList: MessageListInternals, host: St.Widget): void {
    const view = messageList._messageView;
    const sync = () => (host.visible = !view.empty);

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

  private collapseGroupsOnOutsideClick(
    messageList: MessageListInternals,
    menuActor: Clutter.Actor,
  ): void {
    const isAttached = GROUP_COLLAPSERS.some((collapser) =>
      collapser.attachIfSupported(messageList, menuActor, this.undo),
    );
    if (!isAttached) throw new ShellShapeError("CalendarMessageList collapse");
  }
}
