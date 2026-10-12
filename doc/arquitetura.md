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
| 5 | `RoundTogglesFeature` | Grade com 4 colunas e toggles redondos |

Mudar uma preferência chama `FeatureSet.restart(id)` só da feature afetada
(`FEATURE_BY_SETTING`).

## Desfazer

`UndoStack` guarda um desfazer por alteração e roda tudo em ordem inversa. `runAll` garante
que um desfazer com erro não impeça os outros; os erros sobem juntos num `AggregateError`.
`UndoableFeature.enable()` chama o `apply()` da feature e, se ele lançar, roda a pilha antes
de repassar o erro.

## Toggles redondos

- A grade (`QuickSettingsLayout`) passa de `nColumns = 2` para 4. Cada item recebe um novo
  `column-span` de `scaleColumnSpan`: toggle ocupa 1, o que era largura total vira largura
  total, o resto escala na proporção.
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

## Lista de notificações

A seção é um `St.BoxLayout` com a classe `qsn-notifications` (altura máxima 30em, rola por
dentro), adicionada com `menu.addItem(section, nColumns)`. Os mesmos eventos que o
calendário usa para recolher um grupo expandido ao clicar fora (`captured-event::button`,
`::touch`, `::key`) passam a vir do menu do Quick Settings.
