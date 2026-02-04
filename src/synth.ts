import { keyInfo } from "./keys";
import { OscillatorBank, type OscillatorInstance } from "./oscillator-bank";
import { EnvelopeModule } from "./modules/envelope-module";
import { FilterModule, type FilterInstance } from "./modules/filter-module";
import { LFOModule } from "./modules/lfo-module";
import { DelayModule } from "./modules/delay-module";

type Voice = { 
  oscillators: OscillatorInstance[]; 
  gain: GainNode; 
  filterInstance: FilterInstance;
  note: number 
};

type ConstructorConfig = {
  oscillatorBank: OscillatorBank;
  ampEnvelope: EnvelopeModule;
  filterModule: FilterModule;
  lfoModule: LFOModule;
  delayModule: DelayModule;
  polyEl: HTMLInputElement;
  masterVolumeEl: HTMLInputElement;
}

/**
 * Synth class orchestrates all synthesizer modules
 * Manages voices, audio routing, and module coordination
 */
export class Synth {
  audioCtx: AudioContext | null = null;
  masterGain!: GainNode;
  voices = new Map<string, Voice>();
  
  // Effects routing
  effectsInput!: GainNode;

  // Modules
  private readonly oscillatorBank: OscillatorBank;
  private readonly ampEnvelope: EnvelopeModule;
  private readonly filterModule: FilterModule;
  private readonly lfoModule: LFOModule;
  private readonly delayModule: DelayModule;

  polyEl: HTMLInputElement;
  masterVolumeEl: HTMLInputElement;

  constructor({
    oscillatorBank,
    ampEnvelope,
    filterModule,
    lfoModule,
    delayModule,
    polyEl,
    masterVolumeEl
  }: ConstructorConfig) {
    this.oscillatorBank = oscillatorBank;
    this.ampEnvelope = ampEnvelope;
    this.filterModule = filterModule;
    this.lfoModule = lfoModule;
    this.delayModule = delayModule;
    this.polyEl = polyEl;
    this.masterVolumeEl = masterVolumeEl;
    
    this.setupParameterListeners();
  }

  /**
   * Setup event listeners for master parameters
   * @private
   */
  private setupParameterListeners() {
    this.masterVolumeEl.addEventListener('input', () => {
      if (this.masterGain) {
        this.masterGain.gain.value = Number.parseFloat(this.masterVolumeEl.value);
      }
    });
  }

  /**
   * Ensure audio context and all modules are initialized
   * Sets up the complete audio signal chain
   */
  ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      
      // Master gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = Number.parseFloat(this.masterVolumeEl.value);
      
      // Initialize LFO
      this.lfoModule.initialize(this.audioCtx);
      
      // Initialize delay effect
      const delayNodes = this.delayModule.initialize(this.audioCtx, this.masterGain);
      this.effectsInput = delayNodes.input;
      
      // Connect master to output
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  /**
   * Trigger a note on event using a keyboard key
   * @param key - The keyboard key pressed
   */
  noteOn(key: string) {
    const info = keyInfo[key];
    if (!info) return;
    this.playFrequency(key, info.freq, 1);
  }

  /**
   * Play a frequency with the synthesizer
   * @param key - Unique identifier for this voice
   * @param freq - Frequency to play in Hz
   * @param velocity - Note velocity (0-1)
   */
  playFrequency(key: string, freq: number, velocity: number = 1) {
    this.ensureAudio();
    if (!this.audioCtx) return;

    const isPoly = this.polyEl.checked;
    if (!isPoly) {
      for (const v of this.voices.values()) {
        this.oscillatorBank.stopOscillators(v.oscillators);
      }
      this.voices.clear();
    }

    // Get LFO modulation nodes
    const lfoToFilter = this.lfoModule.getFilterModulation();
    const lfoToPitch = this.lfoModule.getPitchModulation();

    // Create filter using FilterModule
    const filterInstance = this.filterModule.createFilter(this.audioCtx, lfoToFilter ?? undefined);
    
    // Voice gain
    const gain = this.audioCtx.createGain();
    
    // Create oscillators using the oscillator bank
    const oscillators = this.oscillatorBank.createOscillators(
      this.audioCtx,
      freq,
      filterInstance.filter,
      lfoToPitch ?? undefined
    );
    
    // Connect filter to gain to effects
    filterInstance.filter.connect(gain);
    gain.connect(this.effectsInput);

    const now = this.audioCtx.currentTime;
    
    // Apply amplitude envelope using EnvelopeModule
    const targetGain = 0.3 * velocity;
    this.ampEnvelope.applyEnvelope(gain.gain, now, 0, targetGain);
    
    // Apply filter envelope using FilterModule
    this.filterModule.applyEnvelope(filterInstance, now);

    // Start all oscillators
    this.oscillatorBank.startOscillators(oscillators);
    
    this.voices.set(key, { oscillators, gain, filterInstance, note: 0 });
  }

  /**
   * Stop a voice by its key identifier
   * @param key - The key identifier for the voice to stop
   */
  stopVoice(key: string) {
    const v = this.voices.get(key);
    if (!v || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    
    // Apply amplitude release using EnvelopeModule
    const ampRelease = this.ampEnvelope.applyRelease(v.gain.gain, now);
    
    // Apply filter release using FilterModule
    const filterRelease = this.filterModule.applyRelease(v.filterInstance, now);
    
    const maxReleaseTime = Math.max(ampRelease, filterRelease);
    this.oscillatorBank.stopOscillators(v.oscillators, now + maxReleaseTime);
    
    this.voices.delete(key);
  }
}

