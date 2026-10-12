/**
 * A seção de notificações só aparece quando há algo nela (notificação ou player de
 * mídia). Lista vazia não mostra ícone nem texto: a seção some e o painel encolhe.
 */
export interface NotificationListState {
  readonly isEmpty: boolean;
}

export const isNotificationSectionVisible = ({ isEmpty }: NotificationListState): boolean =>
  !isEmpty;
