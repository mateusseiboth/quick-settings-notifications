# Arquitetura

## Features

`NotificationCenterSession` (src/app) cria as features na ordem abaixo e as entrega a uma
`FeatureSet`, que liga em ordem, desliga ao contrário e isola falhas. Feature que quebra ao
ligar é registrada no log e não é desligada depois; as outras seguem.

| Ordem | Feature | O que faz |
| --- | --- | --- |
| 1 | `BannerPositionFeature` | `Main.messageTray.bannerAlignment` conforme a preferência |
| 2 | `MessageTrayShortcutFeature` | Super+V passa a chamar `Main.panel.toggleQuickSettings()` |
| 3 | `NotificationListFeature` | Move o `CalendarMessageList` para o fim do Quick Settings ou para um painel separado abaixo dele |
| 4 | `MessagesIndicatorFeature` | Move o indicador de não lidas do relógio para um `SystemIndicator` |
| 5 | `HeaderLayoutFeature` | Avatar à esquerda; captura de tela e configurações à direita |
| 6 | `RoundTogglesFeature` | Grade com 4 colunas e toggles redondos |
| 7 | `PillTogglesFeature` | Toggles em pílula fina quando o redondo está desligado |
| 8 | `TopBarStyleFeature` | Barra superior normal, transparente, ou transparente com fundo em cada zona |

Mudar uma preferência chama `FeatureSet.restartAll(ids)` com as features afetadas
(`FEATURES_BY_SETTING`): TODAS desligam antes de qualquer uma ligar. O formato dos toggles
afeta duas features (redondo e pílula) que mexem nos mesmos atores; reiniciando uma de cada
vez, o desfazer de uma devolvia o subtítulo que a outra tinha tirado. Ao reiniciar, a lista de notificações volta para a grade DEPOIS
dos toggles redondos; quem a converte para a largura total é o `child-added` que a
`RoundTogglesFeature` já observa.

## Formato dos toggles

- Redondo (`round-toggles` ligado): ver a seção abaixo.
- Pílula (`round-toggles` desligado): o toggle nativo do GNOME 50, mais fino. A grade ganha
  `qsn-pill-grid`, cuja regra baixa a altura mínima de 3.273em (tema) para 2.5em, e o
  subtítulo sai dos toggles de uma coluna (a grade dá a cada linha a altura do toggle mais
  alto, e um subtítulo engrossava a linha inteira). Nenhuma cor muda: o estado ligado usa
  a cor de destaque do sistema, que cada distro (e o usuário) define.
- Os dois formatos usam o `GridItemTracker` (src/feature/grid) para converter os itens de
  agora e os que entram depois, cada um com a própria pilha de desfazer.

## Desfazer

Ator nativo que muda de pai volta pelo `insertKeepingVisibility`: o Clutter MOSTRA todo
ator que ganha um pai (`show-on-set-parent`), e o que estava oculto voltava visível.

`UndoStack` guarda um desfazer por alteração e roda tudo em ordem inversa. `runAll` garante
que um desfazer com erro não impeça os outros; os erros sobem juntos num `AggregateError`.
`UndoableFeature.enable()` chama o `apply()` da feature e, se ele lançar, roda a pilha antes
de repassar o erro.

## Toggles redondos

- A grade (`QuickSettingsLayout`) passa de `nColumns = 2` para 4, com largura fixa de 25em.
  `resolveGridPlacement` decide cada item: o que ocupava a largura toda continua assim e sem
  reestilo; toggle de uma coluna vira redondo; o resto escala na proporção.
- `TOGGLE_RESTYLERS` é a lista de strategies por tipo de toggle. O toggle com menu vem
  primeiro, porque também tem `_box`.
- Toggle simples: caixa vertical, ícone com a classe `qsn-round-icon` (o círculo), título
  centralizado, subtítulo removido.
- Toggle com menu: o toggle de dentro recebe o mesmo tratamento; separador e botão da seta
  saem; o título vai para um botão `Título ▾` que abre o menu. A seta segue a propriedade
  `menu-enabled`.
- Cada item tem a própria `UndoStack`. Se o item for destruído antes (a extensão dona
  desligou), a pilha dele é descartada.
- Itens adicionados depois por outras extensões também são convertidos (sinal `child-added`
  + espera de um quadro).

## Cabeçalho

O `SystemItem` nativo é `[bateria, espaçador-notebook, captura, configurações,
espaçador-desktop, cadeado, desligar]`, com só um espaçador visível. A feature insere o
`Avatar` do `userWidget.js` (32px, classe própria `qsn-avatar`) no começo e move o espaçador de desktop para logo depois do de
notebook. Resultado: `[avatar, bateria?, espaço, captura, configurações, cadeado,
desligar]`. Clicar no avatar fecha o menu e abre `gnome-users-panel.desktop`.

## Lista de notificações

`SECTION_HOSTS` (src/feature/notificationList) decide onde a seção entra, pela preferência
`separate-notification-panel`:

- Quick Settings: `menu.addItem(section, nColumns)`, no fim da grade.
- Painel separado: um `St.BoxLayout` com as classes do cartão do Quick Settings
  (`popup-menu-content quick-settings`), filho do `menu.actor` e irmão do `BoxPointer`.
  Fundo, borda, sombra e recuo vêm do tema. Três `BindConstraint` o prendem logo abaixo:
  X e largura iguais aos do `BoxPointer`, e Y com deslocamento = altura do `BoxPointer` +
  12px (`resolveSeparatePanelOffset`), atualizado no `notify::height`; `opacity` e `translation-y` seguem a animação do `BoxPointer`. Como é
  filho do `menu.actor`, aparece e some com o menu, está no grupo de foco dele, e o
  clique nele não fecha o menu. Fica acima do `BoxPointer` e abaixo da camada dos
  submenus.

A estratégia devolve o ator que some quando a lista está vazia (a seção, ou o painel
inteiro).

A seção é um `St.BoxLayout` com a classe `qsn-notifications` (largura 25em, altura máxima
30em, rola por dentro), adicionada com `menu.addItem(section, nColumns)`. Ela fica oculta
enquanto o `MessageView` estiver vazio (`notify::empty`), e o botão "Limpar" é alinhado à
direita (`x_align = END`). Margem, recuo e borda que a lista tinha no calendário são zerados
por estilo inline na lista, no `MessageView` (que reservava 12px para a barra de rolagem)
e na barra do "Limpar", para a seção encostar nas bordas do painel. Os mesmos eventos que o
calendário usa para recolher um grupo expandido ao clicar fora (`captured-event::button`,
`::touch`, `::key`) passam a vir do menu do Quick Settings.

## Barra superior

`TopBarStyleFeature` aplica as mudanças que o estilo pede (`resolveTopBarLook`):

- Fundo transparente: estilo INLINE `background-color: transparent` no `Main.panel`,
  somado ao estilo inline que já houver. A regra `#panel` do tema é por id e ganha de
  qualquer classe da folha da extensão.
- Zonas: a classe `qsn-top-bar-zone` nas três caixas da barra (`_leftBox`, `_centerBox`,
  `_rightBox`): fundo escuro translúcido e cantos redondos. O `Panel` aloca cada caixa com
  a largura natural dela, então o fundo abraça só os botões. Caixa sem item visível tem
  largura zero e o fundo não aparece.
