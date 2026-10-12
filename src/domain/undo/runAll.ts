/**
 * Roda todas as ações, mesmo que alguma falhe, e lança os erros juntos no fim.
 * Restaurar o Shell pela metade é pior do que restaurar tudo e reclamar depois.
 */
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
