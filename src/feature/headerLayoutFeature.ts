import AccountsService from "gi://AccountsService";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import Shell from "gi://Shell";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as UserWidget from "resource:///org/gnome/shell/ui/userWidget.js";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import {
  requireQuickSettings,
  requireSystemItem,
  type SystemItemInternals,
} from "@infra/gnome/shellInternals";

interface AvatarWidget extends St.Bin {
  update(): void;
}
type AvatarConstructor = new (
  user: AccountsService.User,
  params: { iconSize: number; styleClass: string },
) => AvatarWidget;
const { Avatar } = UserWidget as unknown as { Avatar: AvatarConstructor };

const AVATAR_SIZE = 32;
const USERS_PANEL = "gnome-users-panel.desktop";

export class HeaderLayoutFeature extends UndoableFeature {
  readonly id = FeatureId.HEADER_LAYOUT;

  protected apply(): void {
    const systemItem = requireSystemItem(requireQuickSettings().grid);

    this.addAvatar(systemItem.child);
    this.moveButtonsRight(systemItem);
  }

  private addAvatar(box: St.BoxLayout): void {
    const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());
    const avatar = new Avatar(user, { iconSize: AVATAR_SIZE, styleClass: "qsn-avatar" });
    const button = new St.Button({
      style_class: "qsn-avatar-button",
      child: avatar,
      can_focus: true,
      y_align: Clutter.ActorAlign.CENTER,
      accessible_name: user.get_real_name() ?? GLib.get_user_name(),
    });
    button.connect("clicked", () => this.openUserSettings());

    const userIds = [
      user.connect("notify::is-loaded", () => avatar.update()),
      user.connect("changed", () => avatar.update()),
    ];
    avatar.update();

    box.insert_child_at_index(button, 0);
    this.undo.push(() => {
      userIds.forEach((id) => user.disconnect(id));
      button.destroy();
    });
  }

  private moveButtonsRight({
    child: box,
    _laptopSpacer,
    _desktopSpacer,
  }: SystemItemInternals): void {
    const children = box.get_children();
    const originalIndex = children.indexOf(_desktopSpacer);
    const targetIndex = children.indexOf(_laptopSpacer) + 1;

    box.set_child_at_index(_desktopSpacer, targetIndex);
    this.undo.push(() => box.set_child_at_index(_desktopSpacer, originalIndex));
  }

  private openUserSettings(): void {
    Main.panel.closeQuickSettings();
    Shell.AppSystem.get_default().lookup_app(USERS_PANEL)?.activate();
  }
}
