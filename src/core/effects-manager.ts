import type { 
  BaseEffectModule, 
  EffectMetadata, 
  EffectRegistration,
} from '../modules/base-effect-module';

/**
 * EffectsManager orchestrates the effects chain
 * Handles effect registration, initialization, and routing
 */
export class EffectsManager {
  private readonly effects: Map<string, EffectRegistration> = new Map();
  private initialized = false;
  private chainInput: GainNode | null = null;
  private chainOutput: GainNode | null = null;

  /**
   * Register an effect module with metadata
   * @param module - The effect module to register
   * @param metadata - Metadata about the effect (id, name, order, category)
   */
  register(module: BaseEffectModule, metadata: EffectMetadata): void {
    if (this.initialized) {
      throw new Error('Cannot register effects after initialization');
    }

    if (this.effects.has(metadata.id)) {
      throw new Error(`Effect with id "${metadata.id}" is already registered`);
    }

    this.effects.set(metadata.id, { module, metadata });
  }

  /**
   * Initialize all registered effects in the correct order
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - Final destination (usually master gain)
   * @returns The input node of the effects chain
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): GainNode {
    if (this.initialized) {
      throw new Error('EffectsManager already initialized');
    }

    // Create chain output (connects to destination)
    this.chainOutput = audioCtx.createGain();
    this.chainOutput.connect(destination);

    // Sort effects by order (highest to lowest, since we build backwards)
    const sortedEffects = Array.from(this.effects.values())
      .sort((a, b) => b.metadata.order - a.metadata.order);

    // Build chain backwards from destination
    let currentDestination: AudioNode = this.chainOutput;

    for (const { module, metadata } of sortedEffects) {
      console.log(`Initializing effect: ${metadata.name} (order: ${metadata.order})`);
      
      const nodes = module.initialize(audioCtx, currentDestination);
      
      // Verify the module properly initialized
      if (!nodes.input || !nodes.output) {
        throw new Error(`Effect "${metadata.id}" failed to initialize properly`);
      }

      // Connect output to current destination
      nodes.output.connect(currentDestination);
      
      // Next effect will connect to this effect's input
      currentDestination = nodes.input;
    }

    // The first effect's input becomes the chain input
    this.chainInput = currentDestination as GainNode;
    this.initialized = true;

    console.log(`Effects chain initialized with ${this.effects.size} effects`);
    return this.chainInput;
  }

  /**
   * Get the input node for the entire effects chain
   * This is where voices should connect
   * @returns Input gain node, or null if not initialized
   */
  getInput(): GainNode | null {
    return this.chainInput;
  }

  /**
   * Get the output node for the entire effects chain
   * @returns Output gain node, or null if not initialized
   */
  getOutput(): GainNode | null {
    return this.chainOutput;
  }

  /**
   * Check if the effects chain has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get a specific effect module by ID
   * @param id - The effect ID
   * @returns The effect module, or undefined if not found
   */
  getEffect(id: string): BaseEffectModule | undefined {
    return this.effects.get(id)?.module;
  }

  /**
   * Get all registered effects
   * @returns Array of effect registrations
   */
  getAllEffects(): EffectRegistration[] {
    return Array.from(this.effects.values());
  }

  /**
   * Get effects sorted by order
   * @returns Array of effect registrations sorted by order
   */
  getEffectsByOrder(): EffectRegistration[] {
    return Array.from(this.effects.values())
      .sort((a, b) => a.metadata.order - b.metadata.order);
  }

  /**
   * Get effects by category
   * @param category - The category to filter by
   * @returns Array of effect registrations in that category
   */
  getEffectsByCategory(category: EffectMetadata['category']): EffectRegistration[] {
    return Array.from(this.effects.values())
      .filter(reg => reg.metadata.category === category)
      .sort((a, b) => a.metadata.order - b.metadata.order);
  }

  /**
   * Get the number of registered effects
   * @returns Count of registered effects
   */
  getEffectCount(): number {
    return this.effects.size;
  }

  /**
   * Print the effects chain configuration (for debugging)
   */
  printChain(): void {
    console.log('=== Effects Chain ===');
    const sorted = this.getEffectsByOrder();
    
    sorted.forEach((reg, index) => {
      const arrow = index < sorted.length - 1 ? ' →' : ' → [Master]';
      console.log(
        `${reg.metadata.order}. ${reg.metadata.name} (${reg.metadata.category})${arrow}`
      );
    });
    console.log('====================');
  }

  /**
   * Get a summary of all effects and their initialization status
   */
  getStatus(): { id: string; name: string; initialized: boolean; order: number }[] {
    return Array.from(this.effects.values()).map(({ module, metadata }) => ({
      id: metadata.id,
      name: metadata.name,
      initialized: module.isInitialized(),
      order: metadata.order
    }));
  }
}
