# Internos do GNOME Shell 50 usados

Conferido no gnome-shell 50.5 (código extraído de `/usr/lib64/gnome-shell/libshell-18.so`).

| Ator ou API | Arquivo do Shell | Uso |
| --- | --- | --- |
| `Main.panel.statusArea.dateMenu._messageList` (`CalendarMessageList`) | dateMenu.js, calendar.js | Lista movida para o Quick Settings |
| `CalendarMessageList.maybeCollapseMessageGroupForEvent(event)` | calendar.js | Recolher grupo ao clicar fora |
| `CalendarMessageList._messageView.empty` e `_clearButton` | calendar.js, messageList.js | Esconder a seção vazia; "Limpar" à direita |
| `SystemItem.child`, `_laptopSpacer`, `_desktopSpacer` (classe `quick-settings-system-item`) | status/system.js | Reordenar o cabeçalho |
| `Avatar` | userWidget.js | Foto do usuário no cabeçalho (o `@girs` 50.0.4 não declara; contrato mínimo na feature) |
| `Main.panel.statusArea.dateMenu._indicator` (`MessagesIndicator`) | dateMenu.js | Indicador de não lidas movido. O primeiro filho da caixa do relógio é um espaçador ligado à visibilidade dele, e sai junto |
| `quickSettings.menu._grid` e seu `QuickSettingsLayout` (`nColumns`, `_overlay`, `column-span`) | quickSettings.js | Grade de 4 colunas |
| `QuickToggle._box`, `_icon`, `_title`, `_subtitle` | quickSettings.js | Reestilo redondo |
| `QuickMenuToggle._box`, `_menuButton`, `menuEnabled`, `menu` | quickSettings.js | Reestilo com "Título ▾" |
| `quickSettings.addExternalIndicator(indicator)` | panel.js | Lugar do sino |
| `Main.messageTray.bannerAlignment` | messageTray.js | Posição do aviso |
| `Main.wm.setCustomKeybindingHandler('toggle-message-tray', ...)` | windowManager.js | Super+V |

## O que o Shell 50 já faz e foi reaproveitado

- Agrupamento por app, expansão do grupo e player de mídia vêm do `MessageView`
  (messageList.js), dentro do `CalendarMessageList`.
- O toggle "Não perturbe" já existe no Quick Settings do Shell 50; a extensão só muda o
  formato dele junto com os demais.
- O `MessagesIndicator` continua decidindo quando aparecer (não lidas, respeitando o "Não
  perturbe").
