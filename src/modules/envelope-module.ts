export type EnvelopeConfig = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export class EnvelopeModule {
  private readonly attackEl: HTMLInputElement;
  private readonly decayEl: HTMLInputElement;
  private readonly sustainEl: HTMLInputElement;
  private readonly releaseEl: HTMLInputElement;

  constructor(
    attackEl: HTMLInputElement,
    decayEl: HTMLInputElement,
    sustainEl: HTMLInputElement,
    releaseEl: HTMLInputElement
  ) {
    this.attackEl = attackEl;
    this.decayEl = decayEl;
    this.sustainEl = sustainEl;
    this.releaseEl = releaseEl;
  }

  /**
   * Get the values of the ADSR envelope parameters
   * @returns Object containing parameter values
   */
  getConfig(): EnvelopeConfig {
    return {
      attack: Number.parseFloat(this.attackEl.value),
      decay: Number.parseFloat(this.decayEl.value),
      sustain: Number.parseFloat(this.sustainEl.value),
      release: Number.parseFloat(this.releaseEl.value)
    };
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
    param.setValueAtTime(param.value, startTime);
    param.linearRampToValueAtTime(endValue, startTime + release);

    return release;
  }

  /**
   * Get release time
   * @returns Release time in seconds
   */
  getRelease(): number {
    return Number.parseFloat(this.releaseEl.value);
  }
}