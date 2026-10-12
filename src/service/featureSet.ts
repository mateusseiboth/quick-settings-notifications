/**
 * Ciclo de vida das features da extensão: liga em ordem, desliga na ordem inversa, e
 * isola falhas. Só desliga quem ligou com sucesso.
 */
import type { Feature } from "@domain/feature/feature";

export const FeaturePhase = {
  ENABLE: "enable",
  DISABLE: "disable",
} as const;
export type FeaturePhase = (typeof FeaturePhase)[keyof typeof FeaturePhase];

export type FeatureErrorListener = (id: string, phase: FeaturePhase, error: unknown) => void;

export class FeatureSet {
  private readonly enabled = new Set<Feature>();

  constructor(
    private readonly features: readonly Feature[],
    private readonly onError: FeatureErrorListener,
  ) {}

  enableAll(): void {
    this.features.forEach((feature) => this.enable(feature));
  }

  disableAll(): void {
    [...this.features].reverse().forEach((feature) => this.disable(feature));
  }

  /** Reaplica uma feature ligada (ex.: preferência alterada). */
  restart(id: string): void {
    const feature = this.features.find((candidate) => candidate.id === id);
    if (!feature || !this.enabled.has(feature)) return;

    this.disable(feature);
    this.enable(feature);
  }

  private enable(feature: Feature): void {
    try {
      feature.enable();
      this.enabled.add(feature);
    } catch (error) {
      this.onError(feature.id, FeaturePhase.ENABLE, error);
    }
  }

  private disable(feature: Feature): void {
    if (!this.enabled.delete(feature)) return;

    try {
      feature.disable();
    } catch (error) {
      this.onError(feature.id, FeaturePhase.DISABLE, error);
    }
  }
}
