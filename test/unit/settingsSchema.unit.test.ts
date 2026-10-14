/**
 * O schema GSettings e o código falam das mesmas chaves e dos mesmos valores. Chave que
 * só existe num lado quebra a extensão ao ler a preferência.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BannerPosition } from "@domain/banner/bannerPosition";
import { TopBarStyle } from "@domain/panel/topBarStyle";
import { SettingsKey } from "@infra/gnome/settingsKeys";

const SCHEMA = readFileSync(
  join(
    import.meta.dir,
    "..",
    "..",
    "schemas",
    "org.gnome.shell.extensions.quick-settings-notifications.gschema.xml",
  ),
  "utf8",
);

const keyBlockOf = (key: string): string =>
  SCHEMA.match(new RegExp(`<key name="${key}"[\\s\\S]*?</key>`))?.[0] ?? "";

const schemaKeys = (): string[] =>
  [...SCHEMA.matchAll(/<key name="([^"]+)"/g)].map((match) => match[1] ?? "");

const choicesOf = (key: string): string[] =>
  [...keyBlockOf(key).matchAll(/<choice value="([^"]+)"/g)].map((match) => match[1] ?? "");

describe("schema GSettings", () => {
  test("tem exatamente as chaves do código", () => {
    expect(schemaKeys().sort()).toEqual([...Object.values(SettingsKey)].sort());
  });

  test.each([
    [SettingsKey.BANNER_POSITION, Object.values(BannerPosition)],
    [SettingsKey.TOP_BAR_STYLE, Object.values(TopBarStyle)],
  ])("as opções de %p são as do domínio", (key, values) => {
    expect(choicesOf(key).sort()).toEqual([...values].sort());
  });

  test("a barra superior começa no estilo normal", () => {
    expect(keyBlockOf(SettingsKey.TOP_BAR_STYLE)).toContain(`<default>'${TopBarStyle.DEFAULT}'`);
  });

  test("as notificações começam dentro do Quick Settings", () => {
    expect(keyBlockOf(SettingsKey.SEPARATE_NOTIFICATION_PANEL)).toContain("<default>false");
  });
});
