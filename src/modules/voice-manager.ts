import { OscillatorBank, type OscillatorInstance } from "../oscillator-bank";
import { EnvelopeModule } from "./envelope-module";
import { FilterModule, type FilterInstance } from "./filter-module";
import { LFOModule } from "./lfo-module";

export type Voice = {
  oscillators: OscillatorInstance[];
  gain: GainNode;
  filterInstance: FilterInstance;
  note: number;
  key: string;
};

export type VoiceManagerConfig = {
  polyphonic: boolean;
};

/**
 * VoiceManager handles voice allocation and lifecycle
 * Manages polyphonic vs monophonic modes and voice cleanup
 */
export class VoiceManager {
  private readonly voices = new Map<string, Voice>();
  private readonly polyEl: HTMLInputElement;
  private readonly oscillatorBank: OscillatorBank;
  private readonly ampEnvelope: EnvelopeModule;
  private readonly filterModule: FilterModule;
  private readonly lfoModule: LFOModule;

  constructor(
    polyEl: HTMLInputElement,
    oscillatorBank: OscillatorBank,
    ampEnvelope: EnvelopeModule,
    filterModule: FilterModule,
    lfoModule: LFOModule
  ) {
    this.polyEl = polyEl;
    this.oscillatorBank = oscillatorBank;
    this.ampEnvelope = ampEnvelope;
    this.filterModule = filterModule;
    this.lfoModule = lfoModule;
  }

  /**
   * Get the current voice manager configuration
   * @returns Object containing voice manager parameters
   */
  getConfig(): VoiceManagerConfig {
    return {
      polyphonic: this.polyEl.checked
    };
  }

  /**
   * Create and start a new voice
   * @param audioCtx - The AudioContext to create nodes in
   * @param key - Unique identifier for this voice
   * @param frequency - Frequency to play in Hz
   * @param velocity - Note velocity (0-1)
   * @param destination - The destination node for audio output
   */
  createVoice(
    audioCtx: AudioContext,
    key: string,
    frequency: number,
    velocity: number,
    destination: AudioNode
  ): void {
    const { polyphonic } = this.getConfig();

    // Stop all voices if in monophonic mode
    if (!polyphonic) {
      this.stopAllVoices(audioCtx.currentTime);
    }

    // Get LFO modulation nodes
    const lfoToFilter = this.lfoModule.getFilterModulation();
    const lfoToPitch = this.lfoModule.getPitchModulation();

    // Create filter using FilterModule
    const filterInstance = this.filterModule.createFilter(
      audioCtx,
      lfoToFilter ?? undefined
    );

    // Voice gain
    const gain = audioCtx.createGain();

    // Create oscillators using the oscillator bank
    const oscillators = this.oscillatorBank.createOscillators(
      audioCtx,
      frequency,
      filterInstance.filter,
      lfoToPitch ?? undefined
    );

    // Connect filter to gain to destination
    filterInstance.filter.connect(gain);
    gain.connect(destination);

    const now = audioCtx.currentTime;

    // Apply amplitude envelope
    const targetGain = 0.3 * velocity;
    this.ampEnvelope.applyEnvelope(gain.gain, now, 0, targetGain);

    // Apply filter envelope
    this.filterModule.applyEnvelope(filterInstance, now);

    // Start all oscillators
    this.oscillatorBank.startOscillators(oscillators);

    // Store the voice
    this.voices.set(key, {
      oscillators,
      gain,
      filterInstance,
      note: 0,
      key
    });
  }

  /**
   * Stop a specific voice by its key
   * @param key - The key identifier for the voice to stop
   * @param currentTime - The current audio context time
   */
  stopVoice(key: string, currentTime: number): void {
    const voice = this.voices.get(key);
    if (!voice) return;

    // Apply amplitude release
    const ampRelease = this.ampEnvelope.applyRelease(voice.gain.gain, currentTime);

    // Apply filter release
    const filterRelease = this.filterModule.applyRelease(
      voice.filterInstance,
      currentTime
    );

    // Stop oscillators after the longest release time
    const maxReleaseTime = Math.max(ampRelease, filterRelease);
    this.oscillatorBank.stopOscillators(
      voice.oscillators,
      currentTime + maxReleaseTime
    );

    // Remove voice from map
    this.voices.delete(key);
  }

  /**
   * Stop all active voices
   * @param currentTime - The current audio context time
   */
  stopAllVoices(currentTime: number): void {
    for (const key of this.voices.keys()) {
      this.stopVoice(key, currentTime);
    }
  }

  /**
   * Get a specific voice by its key
   * @param key - The key identifier for the voice
   * @returns The voice object, or undefined if not found
   */
  getVoice(key: string): Voice | undefined {
    return this.voices.get(key);
  }

  /**
   * Get all active voices
   * @returns Map of all active voices
   */
  getAllVoices(): Map<string, Voice> {
    return this.voices;
  }

  /**
   * Get the number of active voices
   * @returns Count of active voices
   */
  getVoiceCount(): number {
    return this.voices.size;
  }

  /**
   * Check if a voice with the given key exists
   * @param key - The key identifier to check
   * @returns True if voice exists, false otherwise
   */
  hasVoice(key: string): boolean {
    return this.voices.has(key);
  }

  /**
   * Clear all voices without triggering release envelopes
   * Used for emergency stop or reset
   */
  clearAllVoices(): void {
    for (const voice of this.voices.values()) {
      this.oscillatorBank.stopOscillators(voice.oscillators);
    }
    this.voices.clear();
  }
}