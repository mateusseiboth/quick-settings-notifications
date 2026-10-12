/**
 * A seção de notificações some do Quick Settings quando não há nada para mostrar.
 */
import { describe, expect, test } from "bun:test";

import { isNotificationSectionVisible } from "@domain/notification/notificationVisibility";

describe("isNotificationSectionVisible", () => {
  test("lista vazia esconde a seção (nada de ícone nem texto de lista vazia)", () => {
    expect(isNotificationSectionVisible({ isEmpty: true })).toBe(false);
  });

  test("com notificação ou player de mídia a seção aparece", () => {
    expect(isNotificationSectionVisible({ isEmpty: false })).toBe(true);
  });
});
