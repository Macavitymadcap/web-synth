import { keyInfo } from "./keys";

type Oscillator = { osc: OscillatorNode; waveform: OscillatorType; detune: number; level: number };
type Voice = { oscillators: Oscillator[]; gain: GainNode; note: number };

export class Synth {
  audioCtx: AudioContext | null = null;
  masterGain!: GainNode;
  voices = new Map<string, Voice>();

  polyEl: HTMLInputElement;
  attackEl: HTMLInputElement;
  releaseEl: HTMLInputElement;
  
  // Oscillator configurations
  oscillatorConfigs: Array<{ waveform: OscillatorType; detune: number; level: number }> = [
    { waveform: "sine", detune: 0, level: 1 }
  ];

  constructor(polyEl: HTMLInputElement, attackEl: HTMLInputElement, releaseEl: HTMLInputElement) {
    this.polyEl = polyEl;
    this.attackEl = attackEl;
    this.releaseEl = releaseEl;
  }

  setOscillatorConfigs(configs: Array<{ waveform: OscillatorType; detune: number; level: number }>) {
    this.oscillatorConfigs = configs.length > 0 ? configs : [{ waveform: "sine", detune: 0, level: 1 }];
  }

  ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.3;
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
        for (const o of v.oscillators) {
          o.osc.stop();
        }
      }
      this.voices.clear();
    }

    const gain = this.audioCtx.createGain();
    gain.connect(this.masterGain);

    const oscillators: Oscillator[] = [];
    
    // Create all oscillators
    for (const config of this.oscillatorConfigs) {
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();
      
      osc.type = config.waveform;
      osc.frequency.value = freq;
      osc.detune.value = config.detune;
      
      oscGain.gain.value = config.level;
      
      osc.connect(oscGain);
      oscGain.connect(gain);
      
      oscillators.push({ osc, waveform: config.waveform, detune: config.detune, level: config.level });
    }

    const now = this.audioCtx.currentTime;
    const attackTime = Number.parseFloat(this.attackEl.value);
    const targetGain = 0.3 * velocity;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(targetGain, now + attackTime);

    // Start all oscillators
    for (const o of oscillators) {
      o.osc.start();
    }
    
    this.voices.set(key, { oscillators, gain, note: 0 });
  }

  stopVoice(key: string) {
    const v = this.voices.get(key);
    if (!v || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const releaseTime = Number.parseFloat(this.releaseEl.value);
    
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value, now);
    v.gain.gain.linearRampToValueAtTime(0, now + releaseTime);
    
    for (const o of v.oscillators) {
      o.osc.stop(now + releaseTime);
    }
    
    this.voices.delete(key);
  }
}

