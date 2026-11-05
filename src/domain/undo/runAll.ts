export const runAll = (actions: readonly (() => void)[], message: string): void => {
  const errors = actions.flatMap((action) => {
    try {
      action();
      return [];
    } catch (error) {
      return [error];
    }
  });

  if (errors.length > 0) throw new AggregateError(errors, message);
};
