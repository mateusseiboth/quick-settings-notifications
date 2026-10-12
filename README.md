# Notificações no Quick Settings

Extensão do GNOME Shell 50 que segue o mockup "Quick Toggles" do GNOME Design:

- As notificações saem do calendário e vão para o fim do Quick Settings, agrupadas por app.
  Clicar num grupo mostra as demais notificações dele, como no calendário.
- Os toggles viram botões redondos em quatro colunas. O círculo liga e desliga. Nos toggles
  com menu, o título vira "Título ▾" e abre as opções, como a seta de antes.
- O aviso de notificação recebida aparece no topo direito em vez do centro.
- O ponto de "não lida" ao lado do relógio vira um sino junto aos ícones do Quick Settings.
- Super+V abre o Quick Settings (onde as notificações estão agora) em vez do calendário.

A lista movida é o próprio `CalendarMessageList` do Shell. Agrupamento, expansão do grupo,
player de mídia, botão "Limpar" e o aviso de lista vazia continuam sendo o código nativo.

## Preferências

- Posição do aviso de notificação: topo à esquerda, ao centro ou à direita (padrão direita).
- Botões rápidos redondos: liga e desliga o formato redondo sem desligar o resto.

## Instalação

```bash
bun install
bun run install:local
gnome-extensions enable quick-settings-notifications@mateusseiboth.github.io
```

No Wayland a extensão nova só carrega depois de sair e entrar na sessão.

## Desenvolvimento

```bash
bun run format:check && bun run lint && bun run typecheck && bun test
bun run build
```

Arquitetura, internos do Shell que a extensão toca e as decisões estão em `doc/`.

## Limitações

- Testada só no GNOME Shell 50.5. A extensão mexe em atores internos (`_messageList`,
  `_grid`, `_box` dos toggles). Se uma versão nova mudar algum deles, aquela parte falha com
  mensagem no log e as outras continuam funcionando.
- O subtítulo dos toggles (nome da rede Wi-Fi, dispositivo Bluetooth) some no formato
  redondo, porque não cabe em quatro colunas. O menu de cada toggle continua mostrando.
- Extensões que também reorganizam o Quick Settings podem brigar pela mesma grade.
