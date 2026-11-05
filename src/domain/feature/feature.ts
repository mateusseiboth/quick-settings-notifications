export interface Feature {
  readonly id: string;
  enable(): void;
  disable(): void;
}
