import type { BaseEffectModule, EffectNodes } from '../modules/base-effect-module';

/**
 * Adapter to wrap existing effect modules so they implement BaseEffectModule
 * This allows gradual migration without breaking existing code
 */
export class EffectModuleAdapter<TModule, TConfig> implements BaseEffectModule {
  constructor(
    private module: TModule,
    private getConfigFn: (module: TModule) => TConfig,
    private initializeFn: (module: TModule, audioCtx: AudioContext, destination: AudioNode) => EffectNodes,
    private getInputFn: (module: TModule) => GainNode | null,
    private getOutputFn: (module: TModule) => GainNode | null,
    private isInitializedFn: (module: TModule) => boolean
  ) {}

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    return this.initializeFn(this.module, audioCtx, destination);
  }

  getInput(): GainNode | null {
    return this.getInputFn(this.module);
  }

  getOutput(): GainNode | null {
    return this.getOutputFn(this.module);
  }

  isInitialized(): boolean {
    return this.isInitializedFn(this.module);
  }

  getConfig(): TConfig {
    return this.getConfigFn(this.module);
  }

  /**
   * Get the underlying module instance
   * Useful for accessing module-specific methods
   */
  getModule(): TModule {
    return this.module;
  }
}

/**
 * Factory function to create adapters for existing effect modules
 * 
 * @example
 * const chorusAdapter = createEffectAdapter(
 *   chorusModule,
 *   (m) => m.getConfig(),
 *   (m, ctx, dest) => m.initialize(ctx, dest),
 *   (m) => m.getInput(),
 *   (m) => m.getOutput(),
 *   (m) => m.isInitialized()
 * );
 */
export function createEffectAdapter<TModule, TConfig>(
  module: TModule,
  getConfigFn: (module: TModule) => TConfig,
  initializeFn: (module: TModule, audioCtx: AudioContext, destination: AudioNode) => EffectNodes,
  getInputFn: (module: TModule) => GainNode | null,
  getOutputFn: (module: TModule) => GainNode | null,
  isInitializedFn: (module: TModule) => boolean
): BaseEffectModule {
  return new EffectModuleAdapter(
    module,
    getConfigFn,
    initializeFn,
    getInputFn,
    getOutputFn,
    isInitializedFn
  );
}

/**
 * Simplified adapter factory for modules that follow the standard pattern
 * Assumes the module has: getConfig(), initialize(), getInput(), getOutput(), isInitialized()
 */
export function createStandardEffectAdapter<TModule extends {
  getConfig(): any;
  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes;
  getInput(): GainNode | null;
  getOutput(): GainNode | null;
  isInitialized(): boolean;
}>(module: TModule): BaseEffectModule {
  return createEffectAdapter(
    module,
    (m) => m.getConfig(),
    (m, ctx, dest) => m.initialize(ctx, dest),
    (m) => m.getInput(),
    (m) => m.getOutput(),
    (m) => m.isInitialized()
  );
}
