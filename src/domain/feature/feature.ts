/**
 * Uma alteração independente no Shell (strategy): liga e desliga sozinha, e o `disable()`
 * desfaz tudo o que o `enable()` fez.
 */
export interface Feature {
  readonly id: string;
  enable(): void;
  disable(): void;
}
