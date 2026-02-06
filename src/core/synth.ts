import { keyInfo } from "./keys";
import { LFOModule } from "../modules/lfo-module";
import { ChorusModule } from "../modules/chorus-module";
import { DelayModule } from "../modules/delay-module";
import { MasterModule } from "../modules/master-module";
import { ReverbModule } from "../modules/reverb-module";
import { VoiceManager } from "../modules/voice-manager";
import { WaveShaperModule } from "../modules/wave-shaper-module";
import { CompressorModule } from "../modules/compressor-module";

/**
 * Synth class orchestrates all synthesiser modules
 * Manages audio context initialization and module coordination
 */
export class Synth {
  audioCtx: AudioContext | null = null;
  masterGain!: GainNode;

  // Effects routing
  effectsInput!: GainNode;

  // Modules
  private readonly lfoModule: LFOModule;
  private readonly chorusModule: ChorusModule;
  private readonly delayModule: DelayModule;
  private readonly masterModule: MasterModule;
  private readonly reverbModule: ReverbModule;
  private readonly voiceManager: VoiceManager;
  private readonly waveShaperModule: WaveShaperModule;
  private readonly compressorModule: CompressorModule;

  constructor(
    lfoModule: LFOModule,
    chorusModule: ChorusModule,
    delayModule: DelayModule,
    masterModule: MasterModule,
    reverbModule: ReverbModule,
    voiceManager: VoiceManager,
    waveShaperModule: WaveShaperModule,
    compressorModule: CompressorModule
  ) {
    this.lfoModule = lfoModule;
    this.chorusModule = chorusModule;
    this.delayModule = delayModule;
    this.masterModule = masterModule;
    this.reverbModule = reverbModule;
    this.voiceManager = voiceManager;
    this.waveShaperModule = waveShaperModule;
    this.compressorModule = compressorModule;
  }

  /**
   * Ensure audio context and all modules are initialized
   * Sets up the complete audio signal chain
   */
  ensureAudio() {
  if (!this.audioCtx) {
    // Initialize master module (creates AudioContext and master gain)
    this.audioCtx = this.masterModule.initialize();
    this.masterGain = this.masterModule.getMasterGain()!;

    // Initialize LFO
    this.lfoModule.initialize(this.audioCtx);

    // Initialize effects chain (back to front)
    const reverbNodes = this.reverbModule.initialize(this.audioCtx, this.masterGain);
    const compressorNodes = this.compressorModule.initialize(this.audioCtx, reverbNodes.output);
    const waveShaperNodes = this.waveShaperModule.initialize(this.audioCtx, compressorNodes.input);
    const delayNodes = this.delayModule.initialize(this.audioCtx, waveShaperNodes.input);
  
    const chorusNodes = this.chorusModule.initialize(this.audioCtx, delayNodes.input);
    this.effectsInput = chorusNodes.input;
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
   * Play a frequency with the synthesiser
   * @param key - Unique identifier for this voice
   * @param freq - Frequency to play in Hz
   * @param velocity - Note velocity (0-1)
   */
  playFrequency(key: string, freq: number, velocity: number = 1) {
    this.ensureAudio();
    if (!this.audioCtx) return;

    this.voiceManager.createVoice(
      this.audioCtx,
      key,
      freq,
      velocity,
      this.effectsInput
    );
  }

  /**
   * Stop a voice by its key identifier
   * @param key - The key identifier for the voice to stop
   */
  stopVoice(key: string) {
    if (!this.audioCtx) return;
    this.voiceManager.stopVoice(key, this.audioCtx.currentTime);
  }

  /**
   * Get the number of active voices
   * @returns Count of active voices
   */
  getVoiceCount(): number {
    return this.voiceManager.getVoiceCount();
  }

  /**
   * Stop all active voices
   */
  stopAllVoices() {
    if (!this.audioCtx) return;
    this.voiceManager.stopAllVoices(this.audioCtx.currentTime);
  }
}

