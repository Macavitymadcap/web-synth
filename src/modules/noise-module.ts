// filepath: /Users/dank/Code/personal/web/web-synth/src/modules/noise-module.ts
import { UIConfigService } from '../services/ui-config-service';

export type NoiseType = 'white' | 'pink' | 'brown';

export type NoiseConfig = {
  type: NoiseType;
  level: number;
  enabled: boolean;
};

export class NoiseModule {
  private readonly elementIds = {
    type: 'noise-type',
    level: 'noise-level',
    enabled: 'noise-enabled'
  };

  private cachedBuffer: AudioBuffer | null = null;
  private cachedType: NoiseType | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): NoiseConfig {
    const typeEl = UIConfigService.getControl(this.elementIds.type);

    // Get range-control's internal input
    const levelControl = document.getElementById(this.elementIds.level);
    const levelInput = levelControl?.querySelector('input[type="range"]') as HTMLInputElement;

    // Get toggle-switch's internal checkbox
    const toggleEl = document.getElementById(this.elementIds.enabled);
    const checkbox = toggleEl?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    const config = {
      type: typeEl.value as NoiseType,
      level: levelInput ? Number.parseFloat(levelInput.value) : 0.3,
      enabled: checkbox?.checked ?? false
    };

    return config;
  }

  /**
   * Create a noise source for a voice
   * Returns an object with the source and gain node for integration
   */
  createNoiseSource(audioCtx: AudioContext): {
    source: AudioBufferSourceNode;
    gain: GainNode;
  } | null {
    const { type, level, enabled } = this.getConfig();

    if (!enabled) {
      return null;
    }

    // Generate buffer if needed or type changed
    if (!this.cachedBuffer || this.cachedType !== type) {
      this.cachedBuffer = this.createNoiseBuffer(audioCtx, type);
      this.cachedType = type;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = this.cachedBuffer;
    source.loop = true;

    const gain = audioCtx.createGain();
    gain.gain.value = level;

    source.connect(gain);

    return { source, gain };
  }

  private createNoiseBuffer(
    audioCtx: AudioContext,
    type: NoiseType
  ): AudioBuffer {
    const duration = 2; // 2 seconds
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    switch (type) {
      case 'white':
        this.fillWhiteNoise(output);
        break;
      case 'pink':
        this.fillPinkNoise(output);
        break;
      case 'brown':
        this.fillBrownNoise(output);
        break;
    }

    return buffer;
  }

  private fillWhiteNoise(output: Float32Array): void {
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private fillPinkNoise(output: Float32Array): void {
    // Voss-McCartney algorithm with 7 octaves
    const octaves = 7;
    const values = new Array(octaves).fill(0);

    for (let i = 0; i < output.length; i++) {
      // Update octave values based on bit patterns
      for (let oct = 0; oct < octaves; oct++) {
        if ((i & (1 << oct)) === 0) {
          values[oct] = Math.random() * 2 - 1;
        }
      }

      // Sum all octaves
      let sum = 0;
      for (let oct = 0; oct < octaves; oct++) {
        sum += values[oct];
      }

      // Normalize and store
      output[i] = sum / octaves;
    }
  }

  private fillBrownNoise(output: Float32Array): void {
    // Random walk algorithm with drift correction
    let accumulator = 0;
    const stepSize = 0.015;
    const driftFactor = 0.998;

    for (let i = 0; i < output.length; i++) {
      const step = (Math.random() * 2 - 1) * stepSize;
      accumulator = (accumulator + step) * driftFactor;

      // Clamp to prevent runaway
      accumulator = Math.max(-1, Math.min(1, accumulator));

      output[i] = accumulator * 3.5; // Compensate amplitude
    }
  }

  private setupParameterListeners(): void {
    // Type change invalidates cache
    UIConfigService.onInput(this.elementIds.type, () => {
      this.cachedBuffer = null;
      this.cachedType = null;
    });

    // Level doesn't affect buffer, only playback gain
    UIConfigService.onInput(this.elementIds.level, () => {
      // Gain is set per-voice, no action needed here
    });

    // Enable/disable doesn't affect buffer
    UIConfigService.onInput(this.elementIds.enabled, () => {
      // Handled in createNoiseSource
    });
  }
}