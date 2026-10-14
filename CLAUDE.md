# quick-settings-notifications

Extensão do GNOME Shell 50 em TypeScript 7, empacotada com `bun build`. Leia `doc/` antes de
mexer.

## Regras deste repositório

- Cada alteração no Shell é uma `Feature` (`src/feature/`) que herda de `UndoableFeature`:
  toda mudança feita no `apply()` registra o desfazer em `this.undo`. Se o `apply()` quebrar
  no meio, o que já foi feito é desfeito. Sem exceção: o `disable()` precisa deixar o Shell
  exatamente como estava.
- Internos do Shell só por `src/infra/gnome/shellInternals.ts`, que confere a forma de cada
  ator antes de devolver (`require*`, `has*Internals`). Não acesse `_algumaCoisa` direto numa
  feature.
- Feature nova: classe em `src/feature/`, id em `FeatureId`, uma linha em `createFeatures`.
  A ORDEM da lista importa (a lista de notificações entra antes dos toggles redondos).
- `domain/` e `service/` não importam valor de `gi://`. É o que deixa o `bun test` rodar.
- Imports por alias (`tsconfig.base.json` e `bunfig.toml`). CSS só no molde de
  `src/style/stylesheet.ts`, todo seletor começando por `.qsn-` (o teste reprova).
- Texto de tela em inglês no código com `_("...")`, traduzido em `po/pt_BR.po`.
- Portão de saída: `bun run format:check && bun run lint && bun run typecheck && bun test`.

## Duplicado de propósito

`scripts/i18n/messageCatalog.ts`, `scripts/install.ts`, o esqueleto de `scripts/build.ts`,
as configs de oxlint/oxfmt e `src/types/*.d.ts` existem iguais no repositório
`gnome-spotlight`. São dois repositórios independentes e ainda não há pacote compartilhado.
Alterou um, replique no outro na mesma tarefa.

## Armadilhas

- Regra do tema GANHA da folha da extensão quando as duas estilizam a mesma propriedade no
  mesmo ator (a margem de `.message-list:ltr` e o recuo de `.message-list-controls`
  continuaram apesar do nosso CSS). Para ator nativo, use estilo inline com desfazer
  (`setInlineStyle` na `NotificationListFeature`). CSS da extensão só para classes nossas.
- O `Avatar` lê `icon-size` do tema; a classe `user-icon` crava 64px e esticava o
  cabeçalho. O avatar usa só a classe `qsn-avatar`.
- A grade e a seção de notificações têm LARGURA FIXA no CSS (25em). Rótulo com reticências
  ainda declara a largura do texto inteiro, e o `QuickSettingsLayout` divide a maior largura
  natural pelo `column-span`: um texto comprido estica as 4 colunas. Foi o que deixou o
  painel com ~750 px na primeira versão. A `quick-settings-audio-panel` (libpanel) ainda
  copia essa largura para o painel dela.
- Só toggle de UMA coluna vira redondo (`resolveGridPlacement`). O "aplicativos em segundo
  plano" é um QuickToggle de largura total e não pode ser convertido.
- `QuickSettingsMenu.addItem` adiciona o ator à grade ANTES de gravar o `column-span`. Por
  isso a conversão de itens novos espera o próximo quadro (`Meta.LaterType.BEFORE_REDRAW`).
- Os toggles redondos tiram as classes `quick-toggle` e `button` do tema. Sem isso as regras
  de pílula do tema (fundo no hover e no checked) brigam com o CSS da extensão.
- Mover o `CalendarMessageList` exige devolver o ator ANTES de destruir a seção que o abriga
  (a pilha de desfazer roda em ordem inversa, então a seção é registrada primeiro).
- O painel de notificações separado é IRMÃO do `BoxPointer` dentro do `menu.actor`, não
  filho dele: o `BoxPointer` desenha o próprio fundo e é redirecionado para fora da tela
  (offscreen). Dentro do `menu.actor` o painel herda abrir/fechar, foco e o clique que não
  fecha o menu.
- `#panel` é regra por ID no tema: classe da extensão não ganha. Fundo da barra só por
  estilo inline com desfazer.
- No modo pílula NÃO se altera a cor do toggle ligado: é a cor de destaque do sistema, que
  muda por distro e por usuário.
- Typecheck em três projetos pelo mesmo motivo do gnome-spotlight (o `global` do Node no
  `@types/bun` colide com o do Shell).
