import { UIConfigService } from "../services/ui-config-service";

export type EnvelopeConfig = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type EnvelopeModuleMode = 'amp' | 'filter';

export class EnvelopeModule {
  private readonly elementIds: {
    attack: string;
    decay: string;
    sustain: string;
    release: string;
  };

  constructor(mode: EnvelopeModuleMode = 'amp') {
    this.elementIds = mode === 'filter'
      ? {
          attack: 'filter-attack',
          decay: 'filter-decay',
          sustain: 'filter-sustain',
          release: 'filter-release',
        }
      : {
          attack: 'attack',
          decay: 'decay',
          sustain: 'sustain',
          release: 'release',
        };
  }

  /**
   * Get the values of the ADSR envelope parameters
   * @returns Object containing parameter values
   */
  getConfig(): EnvelopeConfig {
    const config = UIConfigService.getConfig({
      attack: this.elementIds.attack,
      decay: this.elementIds.decay,
      sustain: this.elementIds.sustain,
      release: this.elementIds.release,
    });
    return config as EnvelopeConfig;
  }

  /**
   * Apply ADSR envelope to an AudioParam (typically gain)
   * @param param - The AudioParam to modulate (e.g., gainNode.gain)
   * @param startTime - When to start the envelope
   * @param startValue - Initial value (usually 0)
   * @param peakValue - Peak value to reach after attack
   */
  applyEnvelope(
    param: AudioParam,
    startTime: number,
    startValue: number,
    peakValue: number
  ): void {
    const { attack, decay, sustain } = this.getConfig();
    const sustainValue = peakValue * sustain;

    param.setValueAtTime(startValue, startTime);
    param.linearRampToValueAtTime(peakValue, startTime + attack);
    param.linearRampToValueAtTime(sustainValue, startTime + attack + decay);
  }

  /**
   * Apply release stage of envelope
   * @param param - The AudioParam to modulate
   * @param startTime - When to start the release
   * @param endValue - Final value (usually 0)
   * @returns Duration of the release phase in seconds
   */
  applyRelease(
    param: AudioParam,
    startTime: number,
    endValue: number = 0
  ): number {
    const { release } = this.getConfig();

    param.cancelScheduledValues(startTime);
    param.setValueAtTime((param as any).value ?? 0, startTime);
    param.linearRampToValueAtTime(endValue, startTime + release);

    return release;
  }

  /**
   * Get release time
   * @returns Release time in seconds
   */
  getRelease(): number {
    return Number.parseFloat(UIConfigService.getInput(this.elementIds.release).value);
  }
}