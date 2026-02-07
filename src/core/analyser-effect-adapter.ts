import type { BaseEffectModule, EffectNodes } from '../modules/base-effect-module';

/**
 * Adapter specifically for SpectrumAnalyserModule
 * Handles the canvas parameter that's needed for visualization
 */
export class SpectrumAnalyserAdapter implements BaseEffectModule {
  private nodes: EffectNodes | null = null;

  constructor(
    private readonly module: {
      initialize(audioCtx: AudioContext, destination: AudioNode, canvas: HTMLCanvasElement): EffectNodes;
      stopVisualization(): void;
    },
    private readonly canvas: HTMLCanvasElement
  ) {}

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    // Call the module's initialize with the canvas parameter
    this.nodes = this.module.initialize(audioCtx, destination, this.canvas);
    return this.nodes;
  }

  getInput(): GainNode | null {
    return this.nodes?.input ?? null;
  }

  getOutput(): GainNode | null {
    return this.nodes?.output ?? null;
  }

  isInitialized(): boolean {
    return this.nodes !== null;
  }

  getConfig(): unknown {
    return {
      // Could expose analyser settings here if needed
      fftSize: 2048,
      smoothingTimeConstant: 0.8
    };
  }

  /**
   * Get the underlying analyser module
   */
  getModule() {
    return this.module;
  }

  /**
   * Stop the visualization animation
   */
  stopVisualization(): void {
    this.module.stopVisualization();
  }
}

/**
 * Factory function to create a spectrum analyser adapter
 * 
 * @param module - The SpectrumAnalyserModule instance
 * @param canvas - The canvas element for visualization
 * 
 * @example
 * const canvas = document.getElementById('spectrum-canvas') as HTMLCanvasElement;
 * const analyserAdapter = createSpectrumAnalyserAdapter(spectrumAnalyserModule, canvas);
 * 
 * effectsManager.register(analyserAdapter, {
 *   id: 'analyser',
 *   name: 'Spectrum Analyser',
 *   order: 40,
 *   category: 'utility'
 * });
 */
export function createSpectrumAnalyserAdapter(
  module: {
    initialize(audioCtx: AudioContext, destination: AudioNode, canvas: HTMLCanvasElement): EffectNodes;
    stopVisualization(): void;
  },
  canvas: HTMLCanvasElement
): BaseEffectModule {
  return new SpectrumAnalyserAdapter(module, canvas);
}