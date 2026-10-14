/**
 * Onde a lista de notificações fica: no fim do Quick Settings ou num painel separado,
 * logo abaixo dele.
 */
import { describe, expect, test } from "bun:test";

import {
  NotificationPlacement,
  resolveSeparatePanelOffset,
  resolveNotificationPlacement,
} from "@domain/notification/notificationPlacement";

/**
 * O painel separado é preso ao TOPO do Quick Settings por deslocamento: altura dele mais o
 * espaço. Prender pela borda (`SnapConstraint`) só movia a borda de cima e esmagava o
 * painel, que ficava com a altura de uma linha.
 */
describe("resolveSeparatePanelOffset", () => {
  test("fica logo abaixo do Quick Settings, com o espaço na escala da tela", () => {
    expect(resolveSeparatePanelOffset({ quickSettingsHeight: 400, gap: 12, scale: 1 })).toBe(412);
    expect(resolveSeparatePanelOffset({ quickSettingsHeight: 800, gap: 12, scale: 2 })).toBe(824);
  });
});

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
