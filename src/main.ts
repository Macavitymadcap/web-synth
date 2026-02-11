// Core
import { OscillatorBank } from "./core/oscillator-bank";
import { SettingsManager } from "./core/settings-manager";
import { Synth } from "./core/synth";

// Modules
import { MasterModule } from "./modules/master-module";
import { VoiceManager } from "./core/voice-manager";
import { EnvelopeModule } from "./modules/envelope-module";
import { FilterModule } from "./modules/filter-module";
import { LFOModule } from "./modules/lfo-module";
import { EffectsManager } from "./core/effects-manager";
import { NoiseModule } from "./modules/noise-module";

// Effects
import { CompressorModule } from "./modules/effects/compressor-module";
import { ChorusModule } from "./modules/effects/chorus-module";
import { PhaserModule } from "./modules/effects/phaser-module";
import { TremoloModule } from "./modules/effects/tremolo-module";
import { FlangerModule } from "./modules/effects/flanger-module";
import { DelayModule } from "./modules/effects/delay-module";
import { DistortionModule } from "./modules/effects/distortion-module";
import { ReverbModule } from "./modules/effects/reverb-module";
import { SpectrumAnalyserModule } from "./modules/effects/spectrum-analyser-module";
import { OscilloscopeModule } from "./modules/effects/oscilloscope-module";

// Handlers
import { createKeyboardHandlers } from "./handlers/keyboard-handlers";
import { createRecordingHandler } from "./handlers/recording-handler";
import { createOctaveChangeHandler } from "./handlers/octave-handler";
import { createMidiToggleHandler } from "./handlers/midi-handler-setup";
import { createOscillatorManager } from "./handlers/oscillator-management";
import { createLFOManager } from "./handlers/lfo-management";

// Components

// Atoms
import "./components/atoms/range-control";
import "./components/atoms/toggle-switch";
import "./components/atoms/subsection-header";
import "./components/atoms/neon-label";
import "./components/atoms/neon-select";
import type { NeonSelect } from "./components/atoms/neon-select";
import "./components/atoms/neon-button";
import type { NeonButton } from "./components/atoms/neon-button";

// Molecules
import "./components/molecules/adsr-controls";
import "./components/molecules/bank-item";
import "./components/molecules/bank-section";
import type { BankSection } from "./components/molecules/bank-section";
import "./components/molecules/controls-group";
import "./components/molecules/effect-module";
import "./components/molecules/instructions-list";
import "./components/molecules/keyboard-mapping-info";

// Organisms
import "./components/organisms/visual-keyboard/dual-keyboard";
import "./components/organisms/visual-keyboard/piano-keyboard";
import type { PianoKeyboard } from "./components/organisms/visual-keyboard/piano-keyboard";
import "./components/organisms/visual-keyboard/visual-keyboard";
import "./components/organisms/module-section";
import "./components/organisms/preset-selector";
import type { PresetSelector } from "./components/organisms/preset-selector";
import "./components/organisms/master-controls";
import "./components/organisms/presets-controls";
import "./components/organisms/oscillator-controls";
import "./components/organisms/lfo-controls";
import "./components/organisms/adsr-module";
import "./components/organisms/filter-module-controls";
import "./components/organisms/spectrum-analyser";
import type { SpectrumAnalyser } from "./components/organisms/spectrum-analyser";
import "./components/organisms/oscilloscope-display";
import type { OscilloscopeDisplay } from "./components/organisms/oscilloscope-display";

// Layout
import "./components/layout/app-header";
import "./components/layout/help-popover";

// Keyboard and MIDI controls
const octaveUpper = document.getElementById("octave-upper") as NeonSelect;
const octaveLower = document.getElementById("octave-lower") as NeonSelect;
const keyboardUpper = document.getElementById("keyboard-upper") as PianoKeyboard;
const keyboardLower = document.getElementById("keyboard-lower") as PianoKeyboard;
const midiToggle = document.getElementById("midi-enabled") as HTMLInputElement;

// Record controls
const recordBtn = document.getElementById("record") as NeonButton;

// Analyser controls
const spectrumAnalyserEl = document.querySelector('spectrum-analyser') as SpectrumAnalyser;
const spectrumCanvas = spectrumAnalyserEl?.getCanvas();

// Oscilloscope controls
const oscilloscopeEl = document.querySelector('oscilloscope-display') as OscilloscopeDisplay;
const oscilloscopeCanvas = oscilloscopeEl?.getCanvas();

// Initialize modules
const oscillatorBank = new OscillatorBank();
const ampEnvelope = new EnvelopeModule('amp');
const filterEnvelope = new EnvelopeModule('filter');
const filterModule = new FilterModule(filterEnvelope);
const masterModule = new MasterModule();
const noiseModule = new NoiseModule();

// Effects
const compressorModule = new CompressorModule();
const chorusModule = new ChorusModule();
const phaserModule = new PhaserModule();
const tremoloModule = new TremoloModule();
const flangerModule = new FlangerModule();
const delayModule = new DelayModule();
const distortionModule = new DistortionModule();
const reverbModule = new ReverbModule();
const spectrumAnalyserModule = new SpectrumAnalyserModule(spectrumCanvas);
const oscilloscopeModule = new OscilloscopeModule(oscilloscopeCanvas);

// Effects Manager
const effectsManager = new EffectsManager();
effectsManager.register(compressorModule, {
  id: 'compressor',
  name: 'Compressor',
  order: 100, // Should be first in chain to tame dynamics before other effects
  category: 'dynamics'
});

effectsManager.register(chorusModule, {
  id: 'chorus',
  name: 'Chorus',
  order: 95,
  category: 'modulation'
});

effectsManager.register(phaserModule, {
  id: 'phaser',
  name: 'Phaser',
  order: 90,
  category: 'modulation'
});

effectsManager.register(tremoloModule, {
  id: 'tremolo',
  name: 'Tremolo',
  order: 85,
  category: 'modulation'
});

effectsManager.register(flangerModule, {
  id: 'flanger',
  name: 'Flanger',
  order: 80,
  category: 'modulation'
});

effectsManager.register(delayModule, {
  id: 'delay',
  name: 'Delay',
  order: 75,
  category: 'time-based'
});

effectsManager.register(distortionModule, {
  id: 'distortion',
  name: 'Distortion',
  order: 70,
  category: 'distortion'
});

effectsManager.register(reverbModule, {
  id: 'reverb',
  name: 'Reverb',
  order: 65, // Last effect before analyser and oscilloscope, so they can visualize the final output including reverb tail
  category: 'time-based'
});

effectsManager.register(spectrumAnalyserModule, {
  id: 'analyser',
  name: 'Spectrum Analyser',
  order: 60, 
  category: 'utility'
});

effectsManager.register(oscilloscopeModule, {
  id: 'oscilloscope',
  name: 'Oscilloscope',
  order: 55,
  category: 'utility'
});



// LFO management
const lfoControls = document.querySelector("lfo-controls");
const lfoSection = lfoControls?.querySelector("bank-section") as BankSection;
let lfoModules: LFOModule[] = [];

// ✅ Don't pass callback yet - we'll handle updates after synth is created
const lfoManager = createLFOManager(
  lfoSection,
  lfoModules,
  () => {} // Empty callback for now
);

// Initialize LFO manager (populates lfoModules array)
lfoManager.initialize();

// ✅ Now lfoModules has LFOs, create voice manager
let voiceManager = new VoiceManager(
  oscillatorBank,
  ampEnvelope,
  filterModule,
  lfoModules,
  noiseModule
);

const synth = new Synth(
  effectsManager,
  lfoModules,
  masterModule,
  voiceManager
);

// ✅ NOW set up the LFO change handler after synth exists
lfoSection.addEventListener('lfos-changed', () => {
  // Recreate voice manager with updated LFOs
  const newVoiceManager = new VoiceManager(
    oscillatorBank,
    ampEnvelope,
    filterModule,
    lfoModules,  // Array was mutated in place
    noiseModule
  );
  
  // Update synth
  synth.updateLFOs(lfoModules, newVoiceManager);
});

// Initialize settings manager and connect it to oscillator bank
const settingsManager = new SettingsManager();
settingsManager.setOscillatorBank(oscillatorBank);

const presetSelector = document.querySelector("preset-selector") as PresetSelector;
if (presetSelector) {
  presetSelector.setSettingsManager(settingsManager);
}

// Initialize handlers
const { keyDownHandler, keyUpHandler, pointerDownHandler, pointerUpHandler, pointerCancelHandler } = 
  createKeyboardHandlers(synth);
const recordButtonClickHandler = createRecordingHandler(synth, recordBtn);
const octaveChangeHandler = createOctaveChangeHandler(
  octaveUpper,
  octaveLower,
  keyboardUpper,
  keyboardLower
);
const midiToggleHandler = createMidiToggleHandler(synth, midiToggle);
const oscillatorControls = document.querySelector("oscillator-controls");
const oscillatorSection = oscillatorControls?.querySelector("bank-section") as BankSection;

const oscillatorManager = createOscillatorManager(
  oscillatorSection,
  oscillatorBank
);

// Initialize oscillator management
oscillatorManager.initialize();

// Load saved settings on startup
window.addEventListener("load", () => {
  const saved = settingsManager.loadFromLocalStorage();
  if (saved) {
    settingsManager.applySettings(saved);
  }
});

// Auto-save on any control change
document.addEventListener("change", () => {
  settingsManager.saveToLocalStorage();
});

// Also save on input events (for range controls)
document.addEventListener("input", () => {
  settingsManager.saveToLocalStorage();
});

// Attach Event Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("pointerdown", pointerDownHandler);
document.addEventListener("pointerup", pointerUpHandler);
document.addEventListener("pointercancel", pointerCancelHandler);
recordBtn.addEventListener("click", recordButtonClickHandler);
octaveUpper.addEventListener("change", octaveChangeHandler);
octaveLower.addEventListener("change", octaveChangeHandler);
midiToggle.addEventListener("change", midiToggleHandler);
document.addEventListener('decay-changed', () => {
  if (synth.audioCtx) {
    reverbModule.updateWithContext(synth.audioCtx);
  }
});

