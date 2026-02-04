export type MasterConfig = {
  volume: number;
};

/**
 * MasterModule manages the master output and audio context
 * Handles master volume control and audio context initialization
 */
export class MasterModule {
  private readonly volumeEl: HTMLInputElement;
  
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor(volumeEl: HTMLInputElement) {
    this.volumeEl = volumeEl;
    
    this.setupParameterListeners();
  }

  /**
   * Get the current master configuration values
   * @returns Object containing master parameters
   */
  getConfig(): MasterConfig {
    return {
      volume: Number.parseFloat(this.volumeEl.value)
    };
  }

  /**
   * Initialize the audio context and master gain
   * @returns AudioContext instance
   */
  initialize(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      
      // Create master gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.getConfig().volume;
      
      // Connect to output
      this.masterGain.connect(this.audioCtx.destination);
    }
    
    return this.audioCtx;
  }

  /**
   * Get the audio context
   * @returns AudioContext instance, or null if not initialized
   */
  getAudioContext(): AudioContext | null {
    return this.audioCtx;
  }

  /**
   * Get the master gain node
   * @returns Master GainNode, or null if not initialized
   */
  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  /**
   * Check if the master module has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.audioCtx !== null;
  }

  /**
   * Set the master volume
   * @param volume - Volume level (0-1)
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.volumeEl.addEventListener('input', () => {
      if (this.masterGain) {
        this.masterGain.gain.value = Number.parseFloat(this.volumeEl.value);
      }
    });
  }
}