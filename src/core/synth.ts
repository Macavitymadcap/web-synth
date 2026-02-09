import { keyInfo } from "./keys";
import { LFOModule } from "../modules/lfo-module";
import { MasterModule } from "../modules/master-module";
import { VoiceManager } from "../core/voice-manager";
import { EffectsManager } from "./effects-manager";

/**
 * Synth class orchestrates all synthesiser modules
 * Manages audio context initialization and module coordination
 */
export class Synth {
  audioCtx: AudioContext | null = null;
  masterGain!: GainNode;
  effectsInput!: GainNode;

  // Modules
  private readonly effectManager: EffectsManager;
  private lfoModules: LFOModule[];  // Make mutable
  private readonly masterModule: MasterModule;
  private voiceManager: VoiceManager;  // Make mutable

  constructor(
    effectsManager: EffectsManager,
    lfoModules: LFOModule[],
    masterModule: MasterModule,
    voiceManager: VoiceManager,
  ) {
    this.effectManager = effectsManager;
    this.lfoModules = lfoModules;
    this.masterModule = masterModule;
    this.voiceManager = voiceManager;
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

      // Initialize all LFOs
      this.lfoModules.forEach(lfo => lfo.initialize(this.audioCtx!));

      // Initialize effects 
      this.effectsInput = this.effectManager.initialize(
        this.audioCtx,
        this.masterGain
      );
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

  /**
   * Update LFO modules and reinitialize if audio context exists
   */
  updateLFOs(newLFOs: LFOModule[], newVoiceManager: VoiceManager): void {
    this.lfoModules = newLFOs;
    this.voiceManager = newVoiceManager;
    
    // Re-initialize LFOs if audio context exists
    if (this.audioCtx) {
      this.lfoModules.forEach(lfo => lfo.initialize(this.audioCtx!));
    }
  }
}

