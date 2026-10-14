/**
 * O ponto de "notificação não lida" ao lado do relógio vira um sino junto aos ícones do
 * Quick Settings, onde as notificações estão agora (como no mockup).
 *
 * O ícone movido é o `MessagesIndicator` nativo, que continua decidindo quando aparece
 * (não lidas, respeitando o "Não perturbe"). O espaçador que centralizava o relógio sai
 * junto, senão o relógio ficaria deslocado.
 */
import type Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import type St from "gi://St";
import * as QuickSettings from "resource:///org/gnome/shell/ui/quickSettings.js";

import { insertKeepingVisibility } from "@domain/actor/insertKeepingVisibility";
import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { requireDateMenu, requireQuickSettings } from "@infra/gnome/shellInternals";

const BELL_ICON = "preferences-system-notifications-symbolic";

export class MessagesIndicatorFeature extends UndoableFeature {
  readonly id = FeatureId.MESSAGES_INDICATOR;

  protected apply(): void {
    const { _indicator: indicator } = requireDateMenu();
    const { button } = requireQuickSettings();
    const clockBox = indicator.get_parent();
    if (!clockBox) throw new Error("O indicador de mensagens não está no relógio.");

    const holder = new QuickSettings.SystemIndicator();
    button.addExternalIndicator(holder);
    this.undo.push(() => holder.destroy());

    this.removeClockPad(clockBox, indicator);
    this.moveIndicator(clockBox, indicator, holder);
    this.restyleAsBell(indicator);

    const binding = indicator.bind_property(
      "visible",
      holder,
      "visible",
      GObject.BindingFlags.SYNC_CREATE,
    );
    this.undo.push(() => binding.unbind());
  }

  private removeClockPad(clockBox: Clutter.Actor, indicator: St.Icon): void {
    const pad = clockBox.get_first_child();
    if (!pad || pad === indicator) return;

    clockBox.remove_child(pad);
    this.undo.push(() => insertKeepingVisibility(clockBox, pad, 0));
  }

  private moveIndicator(clockBox: Clutter.Actor, indicator: St.Icon, holder: St.Widget): void {
    const index = clockBox.get_children().indexOf(indicator);
    clockBox.remove_child(indicator);
    insertKeepingVisibility(holder, indicator);

    this.undo.push(() => {
      holder.remove_child(indicator);
      insertKeepingVisibility(clockBox, indicator, index);
    });
  }

  private restyleAsBell(indicator: St.Icon): void {
    this.undo.apply(
      () => {
        const previous = indicator.icon_name;
        indicator.icon_name = BELL_ICON;
        return previous;
      },
      (previous) => (indicator.icon_name = previous),
    );

    indicator.add_style_class_name("system-status-icon");
    this.undo.push(() => indicator.remove_style_class_name("system-status-icon"));
  }
}
