/**
 * Insere um ator num pai sem mudar se ele está visível.
 *
 * O Clutter MOSTRA todo ator que ganha um pai (`show-on-set-parent`, ligado por padrão).
 * Devolver no desfazer um ator que estava oculto (subtítulo vazio, seta de menu desligada,
 * indicador sem não lidas) o deixava visível: o toggle ganhava uma linha vazia e o título
 * subia.
 */
export interface VisibleActor {
  visible: boolean;
}

export interface ActorContainer<C> {
  insert_child_at_index(child: C, index: number): void;
}

/** Índice negativo põe no fim, como no `insert_child_at_index` do Clutter. */
export const insertKeepingVisibility = <C extends VisibleActor>(
  parent: ActorContainer<C>,
  child: C,
  index = -1,
): void => {
  const { visible } = child;
  parent.insert_child_at_index(child, index);
  child.visible = visible;
};
