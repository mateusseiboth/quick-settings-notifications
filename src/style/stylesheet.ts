/**
 * Folha de estilo da extensão. UM molde, tokens por variante (strategy map); o build grava
 * `stylesheet-dark.css`, `stylesheet-light.css` e `stylesheet.css` (fallback = escuro).
 *
 * Os toggles redondos PERDEM as classes `quick-toggle`/`button` do tema enquanto a
 * extensão está ativa: assim nenhuma regra de pílula do tema (fundo, hover, checked)
 * disputa especificidade com estas, e o visual é desenhado do zero aqui.
 */

export const ThemeVariant = {
  DARK: "dark",
  LIGHT: "light",
} as const;
export type ThemeVariant = (typeof ThemeVariant)[keyof typeof ThemeVariant];

interface ThemeTokens {
  readonly circle: string;
  readonly circleHover: string;
  readonly circleActive: string;
  readonly labelHover: string;
  readonly dimText: string;
}

const THEME_TOKENS: Record<ThemeVariant, ThemeTokens> = {
  [ThemeVariant.DARK]: {
    circle: "rgba(255, 255, 255, 0.12)",
    circleHover: "rgba(255, 255, 255, 0.18)",
    circleActive: "rgba(255, 255, 255, 0.24)",
    labelHover: "rgba(255, 255, 255, 0.08)",
    dimText: "rgba(255, 255, 255, 0.6)",
  },
  [ThemeVariant.LIGHT]: {
    circle: "rgba(0, 0, 0, 0.08)",
    circleHover: "rgba(0, 0, 0, 0.12)",
    circleActive: "rgba(0, 0, 0, 0.16)",
    labelHover: "rgba(0, 0, 0, 0.06)",
    dimText: "rgba(0, 0, 0, 0.55)",
  },
};

const TEMPLATE = `
.qsn-round-grid {
  spacing-rows: 16px;
  spacing-columns: 6px;
}

.qsn-round-toggle {
  min-width: 5.6em;
  max-width: 5.6em;
  padding: 0;
  background-color: transparent;
}

.qsn-round-box {
  spacing: 6px;
}

.qsn-round-icon {
  icon-size: 18px;
  padding: 15px;
  border-radius: 999px;
  background-color: {{circle}};
}

.qsn-round-toggle:hover .qsn-round-icon {
  background-color: {{circleHover}};
}

.qsn-round-toggle:active .qsn-round-icon {
  background-color: {{circleActive}};
}

.qsn-round-toggle:focus .qsn-round-icon {
  box-shadow: inset 0 0 0 2px -st-accent-color;
}

.qsn-round-toggle:checked .qsn-round-icon {
  color: -st-accent-fg-color;
  background-color: -st-accent-color;
}

.qsn-round-toggle:checked:hover .qsn-round-icon {
  background-color: st-lighten(-st-accent-color, 6%);
}

.qsn-round-toggle:insensitive .qsn-round-icon {
  color: {{dimText}};
}

.qsn-round-title {
  font-size: 0.8em;
  font-weight: normal;
}

.qsn-round-label {
  padding: 1px 4px;
  border-radius: 8px;
}

.qsn-round-label:hover {
  background-color: {{labelHover}};
}

.qsn-round-label:focus {
  box-shadow: inset 0 0 0 2px -st-accent-color;
}

.qsn-round-label-box {
  spacing: 2px;
}

.qsn-round-arrow {
  icon-size: 10px;
  color: {{dimText}};
}

.qsn-notifications {
  max-height: 30em;
}

.qsn-notifications .message-list {
  margin: 0;
  padding: 0;
  border-width: 0;
}

.qsn-notifications .message-list-placeholder > StIcon {
  icon-size: 48px;
  margin-bottom: 6px;
}

.qsn-notifications .message-list-controls {
  padding: 6px 0 0;
}
`;

export const buildStylesheet = (variant: ThemeVariant): string => {
  const tokens = THEME_TOKENS[variant];
  return TEMPLATE.replace(
    /\{\{(\w+)\}\}/g,
    (_, name: keyof ThemeTokens) => tokens[name],
  ).trimStart();
};
