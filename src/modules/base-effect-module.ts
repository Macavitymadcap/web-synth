/**
 * Base interface that all effect modules must implement
 * Provides a consistent API for the EffectsManager
 */
export interface EffectNodes {
  input: GainNode;
  output: GainNode;
}

export interface BaseEffectModule {
  /**
   * Initialize the effect with audio context and destination
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - The next node in the signal chain
   * @returns Object containing input and output gain nodes
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes;

  /**
   * Get the input node for this effect
   * @returns Input gain node, or null if not initialized
   */
  getInput(): GainNode | null;

  /**
   * Get the output node for this effect
   * @returns Output gain node, or null if not initialized
   */
  getOutput(): GainNode | null;

  /**
   * Check if the effect has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean;

  /**
   * Get the configuration for this effect
   * @returns Configuration object (type varies by effect)
   */
  getConfig(): unknown;
}

/**
 * Metadata about an effect for ordering and display
 */
export interface EffectMetadata {
  /** Unique identifier for the effect */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Order in the effects chain (lower = earlier in chain) */
  order: number;
  
  /** Category for grouping */
  category: 'modulation' | 'dynamics' | 'time-based' | 'filter' | 'distortion' | 'utility';
  
  /** Whether the effect is enabled by default */
  enabledByDefault?: boolean;
}

/**
 * Effect registration entry
 */
export interface EffectRegistration {
  module: BaseEffectModule;
  metadata: EffectMetadata;
}
