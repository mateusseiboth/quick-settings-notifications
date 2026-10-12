/**
 * Posição do banner de notificação escolhida nas preferências.
 */
import { describe, expect, test } from "bun:test";

import {
  BannerAlignment,
  BannerPosition,
  resolveBannerAlignment,
} from "@domain/banner/bannerPosition";

describe("resolveBannerAlignment", () => {
  test.each([
    [BannerPosition.TOP_LEFT, BannerAlignment.START],
    [BannerPosition.TOP_CENTER, BannerAlignment.CENTER],
    [BannerPosition.TOP_RIGHT, BannerAlignment.END],
  ])("%p alinha em %p", (position, alignment) => {
    expect(resolveBannerAlignment(position)).toBe(alignment);
  });

  test("valor desconhecido cai no topo direito", () => {
    expect(resolveBannerAlignment("bottom")).toBe(BannerAlignment.END);
  });
});
