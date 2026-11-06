import type Clutter from "gi://Clutter";

import type { UndoStack } from "@domain/undo/undoStack";
import {
  hasCaptureContainerInternals,
  hasEventCollapseInternals,
  type MessageListInternals,
} from "@infra/gnome/shellInternals";

export interface GroupCollapser {
  attachIfSupported(
    messageList: MessageListInternals,
    container: Clutter.Actor,
    undo: UndoStack,
  ): boolean;
}

const COLLAPSE_EVENTS = [
  "captured-event::button",
  "captured-event::touch",
  "captured-event::key",
] as const;

const captureContainerCollapser: GroupCollapser = {
  attachIfSupported: (messageList, container, undo) => {
    if (!hasCaptureContainerInternals(messageList)) return false;

    undo.apply(
      () => {
        const previous = messageList._captureContainer;
        messageList.setCaptureContainer(container);
        return previous;
      },
      (previous) => messageList.setCaptureContainer(previous),
    );
    return true;
  },
};

const capturedEventCollapser: GroupCollapser = {
  attachIfSupported: (messageList, container, undo) => {
    if (!hasEventCollapseInternals(messageList)) return false;

    const ids = COLLAPSE_EVENTS.map((signal) =>
      container.connect(signal, (_actor: Clutter.Actor, event: Clutter.Event) =>
        messageList.maybeCollapseMessageGroupForEvent(event),
      ),
    );
    undo.push(() => ids.forEach((id) => container.disconnect(id)));
    return true;
  },
};

export const GROUP_COLLAPSERS: readonly GroupCollapser[] = [
  captureContainerCollapser,
  capturedEventCollapser,
];
