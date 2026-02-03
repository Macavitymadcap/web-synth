import { keyInfo } from "./keys";
import { OscillatorBank, type OscillatorInstance } from "./oscillator-bank";

type Voice = { 
  oscillators: OscillatorInstance[]; 
  gain: GainNode; 
  filter: BiquadFilterNode;
  filterEnv: GainNode;
  note: number 
};

type ConstructorConfig = {
  oscillatorBank: OscillatorBank;
  polyEl: HTMLInputElement;
  attackEl: HTMLInputElement;
  decayEl: HTMLInputElement;
  sustainEl: HTMLInputElement;
  releaseEl: HTMLInputElement;
  filterCutoffEl: HTMLInputElement;
  filterResonanceEl: HTMLInputElement;
  filterEnvAmountEl: HTMLInputElement;
  filterAttackEl: HTMLInputElement;
  filterDecayEl: HTMLInputElement;
  filterSustainEl: HTMLInputElement;
  filterReleaseEl: HTMLInputElement;
  lfoRateEl: HTMLInputElement;
  lfoToFilterEl: HTMLInputElement;
  lfoToPitchEl: HTMLInputElement;
  lfoWaveformEl: HTMLSelectElement;
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

  // LFO
  lfo!: OscillatorNode;
  lfoGain!: GainNode;
  lfoToFilter!: GainNode;
  lfoToPitch!: GainNode;

  // Oscillator bank
  private readonly oscillatorBank: OscillatorBank;

  polyEl: HTMLInputElement;
  attackEl: HTMLInputElement;
  decayEl: HTMLInputElement;
  sustainEl: HTMLInputElement;
  releaseEl: HTMLInputElement;
  
  // Filter controls
  filterCutoffEl: HTMLInputElement;
  filterResonanceEl: HTMLInputElement;
  filterEnvAmountEl: HTMLInputElement;
  filterAttackEl: HTMLInputElement;
  filterDecayEl: HTMLInputElement;
  filterSustainEl: HTMLInputElement;
  filterReleaseEl: HTMLInputElement;
  
  // LFO controls
  lfoRateEl: HTMLInputElement;
  lfoToFilterEl: HTMLInputElement;
  lfoToPitchEl: HTMLInputElement;
  lfoWaveformEl: HTMLSelectElement;
  
  // Delay controls
  delayTimeEl: HTMLInputElement;
  delayFeedbackEl: HTMLInputElement;
  delayMixEl: HTMLInputElement;
  
  // Master volume
  masterVolumeEl: HTMLInputElement;

  constructor({
    oscillatorBank,
    polyEl,
    attackEl,
    decayEl,
    sustainEl,
    releaseEl,
    filterCutoffEl,
    filterResonanceEl,
    filterEnvAmountEl,
    filterAttackEl,
    filterDecayEl,
    filterSustainEl,
    filterReleaseEl,
    lfoRateEl,
    lfoToFilterEl,
    lfoToPitchEl,
    lfoWaveformEl,
    delayTimeEl,
    delayFeedbackEl,
    delayMixEl,
    masterVolumeEl
  }: ConstructorConfig) {
    this.oscillatorBank = oscillatorBank;
    this.polyEl = polyEl;
    this.attackEl = attackEl;
    this.decayEl = decayEl;
    this.sustainEl = sustainEl;
    this.releaseEl = releaseEl;
    
    this.filterCutoffEl = filterCutoffEl;
    this.filterResonanceEl = filterResonanceEl;
    this.filterEnvAmountEl = filterEnvAmountEl;
    this.filterAttackEl = filterAttackEl;
    this.filterDecayEl = filterDecayEl;
    this.filterSustainEl = filterSustainEl;
    this.filterReleaseEl = filterReleaseEl;
    
    this.lfoRateEl = lfoRateEl;
    this.lfoToFilterEl = lfoToFilterEl;
    this.lfoToPitchEl = lfoToPitchEl;
    this.lfoWaveformEl = lfoWaveformEl;
    
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
    
    // LFO parameters
    this.lfoRateEl.addEventListener('input', () => {
      if (this.lfo) {
        this.lfo.frequency.value = Number.parseFloat(this.lfoRateEl.value);
      }
    });
    
    this.lfoToFilterEl.addEventListener('input', () => {
      if (this.lfoToFilter) {
        this.lfoToFilter.gain.value = Number.parseFloat(this.lfoToFilterEl.value);
      }
    });
    
    this.lfoToPitchEl.addEventListener('input', () => {
      if (this.lfoToPitch) {
        this.lfoToPitch.gain.value = Number.parseFloat(this.lfoToPitchEl.value);
      }
    });
    
    this.lfoWaveformEl.addEventListener('change', () => {
      if (this.lfo) {
        this.lfo.type = this.lfoWaveformEl.value as OscillatorType;
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
      
      // LFO setup
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.type = this.lfoWaveformEl.value as OscillatorType;
      this.lfo.frequency.value = Number.parseFloat(this.lfoRateEl.value);
      
      this.lfoGain = this.audioCtx.createGain();
      this.lfoGain.gain.value = 1;
      
      this.lfoToFilter = this.audioCtx.createGain();
      this.lfoToFilter.gain.value = Number.parseFloat(this.lfoToFilterEl.value);
      
      this.lfoToPitch = this.audioCtx.createGain();
      this.lfoToPitch.gain.value = Number.parseFloat(this.lfoToPitchEl.value);
      
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.lfoToFilter);
      this.lfoGain.connect(this.lfoToPitch);
      
      this.lfo.start();
      
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

    // Create filter
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Number.parseFloat(this.filterCutoffEl.value);
    filter.Q.value = Number.parseFloat(this.filterResonanceEl.value);
    
    // Filter envelope modulation amount
    const filterEnv = this.audioCtx.createGain();
    const filterEnvAmount = Number.parseFloat(this.filterEnvAmountEl.value);
    filterEnv.gain.value = filterEnvAmount;
    filterEnv.connect(filter.frequency);
    
    // Connect LFO to filter
    this.lfoToFilter.connect(filter.frequency);
    
    // Voice gain
    const gain = this.audioCtx.createGain();
    
    // Create oscillators using the oscillator bank
    const oscillators = this.oscillatorBank.createOscillators(
      this.audioCtx,
      freq,
      filter,
      this.lfoToPitch
    );
    
    // Connect filter to gain to effects
    filter.connect(gain);
    gain.connect(this.effectsMix);

    const now = this.audioCtx.currentTime;
    
    // Amplitude envelope (ADSR)
    const attack = Number.parseFloat(this.attackEl.value);
    const decay = Number.parseFloat(this.decayEl.value);
    const sustain = Number.parseFloat(this.sustainEl.value);
    const targetGain = 0.3 * velocity;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(targetGain, now + attack);
    gain.gain.linearRampToValueAtTime(targetGain * sustain, now + attack + decay);
    
    // Filter envelope (ADSR)
    const filterAttack = Number.parseFloat(this.filterAttackEl.value);
    const filterDecay = Number.parseFloat(this.filterDecayEl.value);
    const filterSustain = Number.parseFloat(this.filterSustainEl.value);
    
    filterEnv.gain.setValueAtTime(0, now);
    filterEnv.gain.linearRampToValueAtTime(filterEnvAmount, now + filterAttack);
    filterEnv.gain.linearRampToValueAtTime(filterEnvAmount * filterSustain, now + filterAttack + filterDecay);

    // Start all oscillators
    this.oscillatorBank.startOscillators(oscillators);
    
    this.voices.set(key, { oscillators, gain, filter, filterEnv, note: 0 });
  }

  stopVoice(key: string) {
    const v = this.voices.get(key);
    if (!v || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const release = Number.parseFloat(this.releaseEl.value);
    const filterRelease = Number.parseFloat(this.filterReleaseEl.value);
    
    // Amplitude release
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value, now);
    v.gain.gain.linearRampToValueAtTime(0, now + release);
    
    // Filter release
    v.filterEnv.gain.cancelScheduledValues(now);
    v.filterEnv.gain.setValueAtTime(v.filterEnv.gain.value, now);
    v.filterEnv.gain.linearRampToValueAtTime(0, now + filterRelease);
    
    const maxReleaseTime = Math.max(release, filterRelease);
    this.oscillatorBank.stopOscillators(v.oscillators, now + maxReleaseTime);
    
    this.voices.delete(key);
  }
}

