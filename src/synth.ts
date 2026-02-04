import { keyInfo } from "./keys";
import { OscillatorBank, type OscillatorInstance } from "./oscillator-bank";
import { EnvelopeModule } from "./modules/envelope-module";
import { FilterModule, type FilterInstance } from "./modules/filter-module";
import { LFOModule } from "./modules/lfo-module";

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
  polyEl: HTMLInputElement;
  delayTimeEl: HTMLInputElement;
  delayFeedbackEl: HTMLInputElement;
  delayMixEl: HTMLInputElement;
  masterVolumeEl: HTMLInputElement;
}

export class Synth {
  audioCtx: AudioContext | null = null;
  masterGain!: GainNode;
  voices = new Map<string, Voice>();
  
  // Effects chain
  delayNode!: DelayNode;
  delayFeedback!: GainNode;
  delayWet!: GainNode;
  delayDry!: GainNode;
  effectsMix!: GainNode;

  // Modules
  private readonly oscillatorBank: OscillatorBank;
  private readonly ampEnvelope: EnvelopeModule;
  private readonly filterModule: FilterModule;
  private readonly lfoModule: LFOModule;

  polyEl: HTMLInputElement;
  
  // Delay controls
  delayTimeEl: HTMLInputElement;
  delayFeedbackEl: HTMLInputElement;
  delayMixEl: HTMLInputElement;
  
  // Master volume
  masterVolumeEl: HTMLInputElement;

  constructor({
    oscillatorBank,
    ampEnvelope,
    filterModule,
    lfoModule,
    polyEl,
    delayTimeEl,
    delayFeedbackEl,
    delayMixEl,
    masterVolumeEl
  }: ConstructorConfig) {
    this.oscillatorBank = oscillatorBank;
    this.ampEnvelope = ampEnvelope;
    this.filterModule = filterModule;
    this.lfoModule = lfoModule;
    this.polyEl = polyEl;
    
    this.delayTimeEl = delayTimeEl;
    this.delayFeedbackEl = delayFeedbackEl;
    this.delayMixEl = delayMixEl;
    
    this.masterVolumeEl = masterVolumeEl;
    
    // Setup event listeners for real-time parameter changes
    this.setupParameterListeners();
  }

  private setupParameterListeners() {
    // Master volume
    this.masterVolumeEl.addEventListener('input', () => {
      if (this.masterGain) {
        this.masterGain.gain.value = Number.parseFloat(this.masterVolumeEl.value);
      }
    });
    
    // Delay parameters
    this.delayTimeEl.addEventListener('input', () => {
      if (this.delayNode) {
        this.delayNode.delayTime.value = Number.parseFloat(this.delayTimeEl.value);
      }
    });
    
    this.delayFeedbackEl.addEventListener('input', () => {
      if (this.delayFeedback) {
        this.delayFeedback.gain.value = Number.parseFloat(this.delayFeedbackEl.value);
      }
    });
    
    this.delayMixEl.addEventListener('input', () => {
      if (this.delayWet && this.delayDry) {
        const mix = Number.parseFloat(this.delayMixEl.value);
        this.delayWet.gain.value = mix;
        this.delayDry.gain.value = 1 - mix;
      }
    });
  }

  ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      
      // Master gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = Number.parseFloat(this.masterVolumeEl.value);
      
      // Effects mix (dry/wet routing)
      this.effectsMix = this.audioCtx.createGain();
      
      // Delay effect
      this.delayNode = this.audioCtx.createDelay(2);
      this.delayNode.delayTime.value = Number.parseFloat(this.delayTimeEl.value);
      
      this.delayFeedback = this.audioCtx.createGain();
      this.delayFeedback.gain.value = Number.parseFloat(this.delayFeedbackEl.value);
      
      this.delayWet = this.audioCtx.createGain();
      this.delayDry = this.audioCtx.createGain();
      
      const delayMix = Number.parseFloat(this.delayMixEl.value);
      this.delayWet.gain.value = delayMix;
      this.delayDry.gain.value = 1 - delayMix;
      
      // Wire up delay
      this.effectsMix.connect(this.delayDry);
      this.effectsMix.connect(this.delayNode);
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayWet);
      
      this.delayDry.connect(this.masterGain);
      this.delayWet.connect(this.masterGain);
      
      // Initialize LFO
      this.lfoModule.initialize(this.audioCtx);
      
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  noteOn(key: string) {
    const info = keyInfo[key];
    if (!info) return;
    this.playFrequency(key, info.freq, 1);
  }

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
    gain.connect(this.effectsMix);

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

