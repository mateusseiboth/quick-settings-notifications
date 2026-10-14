/**
 * Barra superior normal, transparente, ou transparente com um fundo arredondado em volta de
 * cada zona (atividades, relógio, ícones e Quick Settings).
 *
 * O fundo da barra sai por estilo INLINE: a regra `#panel` do tema é por id e ganha de
 * qualquer classe da folha da extensão. As zonas recebem a classe `qsn-top-bar-zone`; o
 * tema não estiliza as caixas `panelLeft`, `panelCenter` e `panelRight`, então a classe
 * basta.
 */
import type Gio from "gi://Gio";

import { FeatureId } from "@domain/feature/featureId";
import { UndoableFeature } from "@domain/feature/undoableFeature";
import { resolveTopBarLook, type TopBarLook } from "@domain/panel/topBarStyle";
import type { UndoStack } from "@domain/undo/undoStack";
import { SettingsKey } from "@infra/gnome/settingsKeys";
import { requireTopBar, type TopBarInternals } from "@infra/gnome/shellInternals";

const TRANSPARENT_STYLE = "background-color: transparent;";
const ZONE_CLASS = "qsn-top-bar-zone";

interface TopBarChange {
  isWanted(look: TopBarLook): boolean;
  apply(topBar: TopBarInternals, undo: UndoStack): void;
}

/** Mantém o estilo inline que outra extensão já tenha posto na barra. */
const appendStyle = (previous: string | null, style: string): string =>
  previous ? `${previous.replace(/;?\s*$/, ";")} ${style}` : style;

const clearBackground: TopBarChange = {
  isWanted: (look) => look.isTransparent,
  apply: ({ panel }, undo) =>
    undo.apply(
      () => {
        const previous = panel.get_style();
        panel.set_style(appendStyle(previous, TRANSPARENT_STYLE));
        return previous;
      },
      (previous) => panel.set_style(previous),
    ),
};

const badgeZones: TopBarChange = {
  isWanted: (look) => look.hasZoneBadges,
  apply: ({ zones }, undo) =>
    zones.forEach((zone) => {
      zone.add_style_class_name(ZONE_CLASS);
      undo.push(() => zone.remove_style_class_name(ZONE_CLASS));
    }),
};

const TOP_BAR_CHANGES: readonly TopBarChange[] = [clearBackground, badgeZones];

export class TopBarStyleFeature extends UndoableFeature {
  readonly id = FeatureId.TOP_BAR_STYLE;

  constructor(private readonly settings: Gio.Settings) {
    super();
  }

  protected apply(): void {
    const look = resolveTopBarLook(this.settings.get_string(SettingsKey.TOP_BAR_STYLE));
    const changes = TOP_BAR_CHANGES.filter((change) => change.isWanted(look));
    if (changes.length === 0) return;

    const topBar = requireTopBar();
    changes.forEach((change) => change.apply(topBar, this.undo));
  }
}
