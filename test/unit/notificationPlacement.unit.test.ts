/**
 * Onde a lista de notificações fica: no fim do Quick Settings ou num painel separado,
 * logo abaixo dele.
 */
import { describe, expect, test } from "bun:test";

import {
  NotificationPlacement,
  resolveNotificationPlacement,
} from "@domain/notification/notificationPlacement";

describe("resolveNotificationPlacement", () => {
  test("padrão: dentro do Quick Settings", () => {
    expect(resolveNotificationPlacement({ isSeparatePanel: false })).toBe(
      NotificationPlacement.QUICK_SETTINGS,
    );
  });

  test("painel separado quando a preferência pede", () => {
    expect(resolveNotificationPlacement({ isSeparatePanel: true })).toBe(
      NotificationPlacement.SEPARATE_PANEL,
    );
  });
});
