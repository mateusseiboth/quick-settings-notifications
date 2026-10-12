/**
 * Folha de estilo da extensão. UM molde, tokens por variante (strategy map); o build grava
 * `stylesheet-dark.css`, `stylesheet-light.css` e `stylesheet.css` (fallback = escuro).
 *
 * A grade tem LARGURA FIXA (a mesma do Quick Settings original: 2 x 12em + espaço). Sem
 * isso, qualquer texto comprido de um item (rótulo com reticências ainda declara a largura
 * do texto inteiro) esticava as quatro colunas e o painel ficava enorme.
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
  width: 25em;
  spacing-rows: 10px;
  spacing-columns: 4px;
}

.qsn-round-toggle {
  padding: 0;
  background-color: transparent;
}

.qsn-round-box {
  spacing: 4px;
}

.qsn-round-icon {
  icon-size: 16px;
  padding: 13px;
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

.qsn-avatar-button {
  padding: 0;
  border-radius: 999px;
}

.qsn-avatar {
  icon-size: 32px;
  border-radius: 999px;
  background-size: cover;
  background-color: {{circle}};
}

.qsn-avatar-button:hover {
  background-color: {{labelHover}};
}

.qsn-avatar-button:focus {
  box-shadow: inset 0 0 0 2px -st-accent-color;
}

.qsn-notifications {
  width: 25em;
  max-height: 30em;
}
`;

export const buildStylesheet = (variant: ThemeVariant): string => {
  const tokens = THEME_TOKENS[variant];
  return TEMPLATE.replace(
    /\{\{(\w+)\}\}/g,
    (_, name: keyof ThemeTokens) => tokens[name],
  ).trimStart();
};
