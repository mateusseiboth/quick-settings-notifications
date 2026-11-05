export interface VisibleActor {
  visible: boolean;
}

export interface ActorContainer<C> {
  insert_child_at_index(child: C, index: number): void;
}

export const insertKeepingVisibility = <C extends VisibleActor>(
  parent: ActorContainer<C>,
  child: C,
  index = -1,
): void => {
  const { visible } = child;
  parent.insert_child_at_index(child, index);
  child.visible = visible;
};
