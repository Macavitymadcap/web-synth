import { UIConfigService } from "../services/ui-config-service";
import type { OscillatorBank, OscillatorInstance } from "./oscillator-bank";
import type { EnvelopeModule } from "../modules/envelope-module";
import type { FilterModule, FilterInstance } from "../modules/filter-module";
import type { LFOModule } from "../modules/lfo-module";
import type { NoiseModule } from "../modules/noise-module";

export type Voice = {
  oscillators: OscillatorInstance[];
  gain: GainNode;
  filterInstance: FilterInstance;
  note: number;
  key: string;
  noiseSource?: AudioBufferSourceNode;
  noiseGain?: GainNode;
};

export type VoiceManagerConfig = {
  polyphonic: boolean;
};

/**
 * VoiceManager handles voice allocation and lifecycle
 * Manages polyphonic vs monophonic modes and voice cleanup
 * Supports multiple LFO routing for complex modulation
 */
export class VoiceManager {
  private readonly voices = new Map<string, Voice>();

  // UI element IDs
  private readonly elementIds = {
    polyphonic: "poly",
  };

  private readonly oscillatorBank: OscillatorBank;
  private readonly ampEnvelope: EnvelopeModule;
  private readonly filterModule: FilterModule;
  private readonly lfoModules: LFOModule[];
  private readonly noiseModule: NoiseModule;

  constructor(
    oscillatorBank: OscillatorBank,
    ampEnvelope: EnvelopeModule,
    filterModule: FilterModule,
    lfoModules: LFOModule[],
    noiseModule: NoiseModule
  ) {
    this.oscillatorBank = oscillatorBank;
    this.ampEnvelope = ampEnvelope;
    this.filterModule = filterModule;
    this.lfoModules = lfoModules;
    this.noiseModule = noiseModule;
  }

  /**
   * Get the current voice manager configuration
   * @returns Object containing voice manager parameters
   */
  getConfig(): VoiceManagerConfig {
    const polyEl = UIConfigService.tryGetControl<HTMLInputElement>(this.elementIds.polyphonic);
    return {
      polyphonic: polyEl ? !!polyEl.checked : true
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

    // Combine LFO modulations from all LFO modules
    const filterModulations = this.lfoModules
      .map(lfo => lfo.getFilterModulation())
      .filter((node): node is GainNode => node !== null);

    const pitchModulations = this.lfoModules
      .map(lfo => lfo.getPitchModulation())
      .filter((node): node is GainNode => node !== null);

    // Create mixer nodes for combining multiple LFO signals
    const combinedFilterMod = this.combineLFOs(audioCtx, filterModulations);
    const combinedPitchMod = this.combineLFOs(audioCtx, pitchModulations);

    // Create filter using FilterModule
    const filterInstance = this.filterModule.createFilter(
      audioCtx,
      combinedFilterMod ?? undefined
    );

    // Voice gain
    const gain = audioCtx.createGain();

    // Create oscillators using the oscillator bank
    const oscillators = this.oscillatorBank.createOscillators(
      audioCtx,
      frequency,
      filterInstance.filter,
      combinedPitchMod ?? undefined
    );

    // Add noise if enabled - BEFORE connecting filter to gain
    const noiseOutput = this.noiseModule.createNoiseSource(audioCtx);
    if (noiseOutput) {
      noiseOutput.source.connect(noiseOutput.gain);
      noiseOutput.gain.connect(filterInstance.filter);
      noiseOutput.source.start();
    }

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
      key,
      noiseSource: noiseOutput?.source,
      noiseGain: noiseOutput?.gain
    });
  }

  /**
   * Combine multiple LFO modulation signals into a single output
   * @param audioCtx - The AudioContext to create nodes in
   * @param modulations - Array of LFO modulation gain nodes
   * @returns Combined gain node or null if no modulations
   * @private
   */
  private combineLFOs(audioCtx: AudioContext, modulations: GainNode[]): GainNode | null {
    if (modulations.length === 0) return null;
    if (modulations.length === 1) return modulations[0];

    // Create a mixer gain node to sum multiple LFO signals
    const mixer = audioCtx.createGain();
    mixer.gain.value = 1 / modulations.length; // Average the signals

    // Connect all LFO modulations to the mixer
    modulations.forEach(mod => mod.connect(mixer));

    return mixer;
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

    // Stop noise source if present
    if (voice.noiseSource) {
      voice.noiseSource.stop(currentTime + maxReleaseTime);
    }

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
      if (voice.noiseSource) {
        voice.noiseSource.stop();
      }
    }
    this.voices.clear();
  }
}