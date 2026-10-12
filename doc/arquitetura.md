# Arquitetura

## Features

`NotificationCenterSession` (src/app) cria as features na ordem abaixo e as entrega a uma
`FeatureSet`, que liga em ordem, desliga ao contrário e isola falhas. Feature que quebra ao
ligar é registrada no log e não é desligada depois; as outras seguem.

| Ordem | Feature | O que faz |
| --- | --- | --- |
| 1 | `BannerPositionFeature` | `Main.messageTray.bannerAlignment` conforme a preferência |
| 2 | `MessageTrayShortcutFeature` | Super+V passa a chamar `Main.panel.toggleQuickSettings()` |
| 3 | `NotificationListFeature` | Move o `CalendarMessageList` para uma seção no fim do Quick Settings |
| 4 | `MessagesIndicatorFeature` | Move o indicador de não lidas do relógio para um `SystemIndicator` |
| 5 | `HeaderLayoutFeature` | Avatar à esquerda; captura de tela e configurações à direita |
| 6 | `RoundTogglesFeature` | Grade com 4 colunas e toggles redondos |

Mudar uma preferência chama `FeatureSet.restart(id)` só da feature afetada
(`FEATURE_BY_SETTING`).

## Desfazer

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

A seção é um `St.BoxLayout` com a classe `qsn-notifications` (largura 25em, altura máxima
30em, rola por dentro), adicionada com `menu.addItem(section, nColumns)`. Ela fica oculta
enquanto o `MessageView` estiver vazio (`notify::empty`), e o botão "Limpar" é alinhado à
direita (`x_align = END`). Margem, recuo e borda que a lista tinha no calendário são zerados
por estilo inline na lista, no `MessageView` (que reservava 12px para a barra de rolagem)
e na barra do "Limpar", para a seção encostar nas bordas do painel. Os mesmos eventos que o
calendário usa para recolher um grupo expandido ao clicar fora (`captured-event::button`,
`::touch`, `::key`) passam a vir do menu do Quick Settings.
