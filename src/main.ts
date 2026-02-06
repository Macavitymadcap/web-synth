// Core
import { OscillatorBank } from "./core/oscillator-bank";
import { SettingsManager } from "./core/settings-manager";
import { Synth } from "./core/synth";

// Modules
import { EnvelopeModule } from "./modules/envelope-module";
import { FilterModule } from "./modules/filter-module";
import { LFOModule } from "./modules/lfo-module";
import { ChorusModule } from "./modules/chorus-module";
import { DelayModule } from "./modules/delay-module";
import { MasterModule } from "./modules/master-module";
import { VoiceManager } from "./modules/voice-manager";
import { ReverbModule } from "./modules/reverb-module";
import { WaveShaperModule } from "./modules/wave-shaper-module";
import { createKeyboardHandlers } from "./handlers/keyboard-handlers";
import { createRecordingHandler } from "./handlers/recording-handler";
import { createOctaveChangeHandler } from "./handlers/octave-handler";
import { createMidiToggleHandler } from "./handlers/midi-handler-setup";
import { createOscillatorManager } from "./handlers/oscillator-management";

// Components
import "./components/atoms/filter-type-picker";
import "./components/atoms/range-control";
import type { RangeControl } from "./components/atoms/range-control";
import "./components/atoms/toggle-switch";
import "./components/atoms/waveform-picker";
import "./components/atoms/octave-picker";
import "./components/atoms/subsection-header";
import "./components/layout/app-header";
import "./components/layout/help-popover";
import "./components/molecules/adsr-controls";
import "./components/molecules/controls-group";
import "./components/molecules/oscillator-control";
import "./components/molecules/instructions-list";
import "./components/organisms/dual-keyboard";
import "./components/molecules/keyboard-mapping-info";
import "./components/organisms/module-section";
import "./components/organisms/oscillator-section";
import "./components/organisms/piano-keyboard";
import type { PianoKeyboard } from "./components/organisms/piano-keyboard";
import "./components/organisms/preset-selector";
import type { PresetSelector } from "./components/organisms/preset-selector";
import { CompressorModule } from "./modules/compressor-module";
import "./components/organisms/master-controls";
import "./components/organisms/presets-controls";
import "./components/organisms/oscillator-controls";
import "./components/organisms/visual-keyboard";
import "./components/organisms/adsr-module";
import "./components/organisms/filter-module-controls";
import "./components/organisms/lfo-module-controls";
import "./components/organisms/chorus-effect";
import "./components/organisms/reverb-effect";
import "./components/organisms/compressor-effect";
import "./components/organisms/delay-effect";
import "./components/organisms/waveshaper-effect";

// Keyboard and MIDI controls
const octaveUpper = document.getElementById("octave-upper") as HTMLSelectElement;
const octaveLower = document.getElementById("octave-lower") as HTMLSelectElement;
const keyboardUpper = document.getElementById("keyboard-upper") as PianoKeyboard;
const keyboardLower = document.getElementById("keyboard-lower") as PianoKeyboard;
const midiToggle = document.getElementById("midi-enabled") as HTMLInputElement;

// ASDR controls
const attack = (document.getElementById("attack") as RangeControl).getInput();
const decay = (document.getElementById("decay") as RangeControl).getInput();
const sustain = (document.getElementById("sustain") as RangeControl).getInput();
const release = (document.getElementById("release") as RangeControl).getInput();

// Filter controls
const filterType = document.getElementById("filter-type") as HTMLSelectElement;
const filterCutoff = (document.getElementById("filter-cutoff") as RangeControl).getInput();
const filterResonance = (document.getElementById("filter-resonance") as RangeControl).getInput();
const filterEnvAmount = (document.getElementById("filter-env-amount") as RangeControl).getInput();
const filterAttack = (document.getElementById("filter-attack") as RangeControl).getInput();
const filterDecay = (document.getElementById("filter-decay") as RangeControl).getInput();
const filterSustain = (document.getElementById("filter-sustain") as RangeControl).getInput();
const filterRelease = (document.getElementById("filter-release") as RangeControl).getInput();

// LFO controls
const lfoRate = (document.getElementById("lfo-rate") as RangeControl).getInput();
const lfoToFilter = (document.getElementById("lfo-to-filter") as RangeControl).getInput();
const lfoToPitch = (document.getElementById("lfo-to-pitch") as RangeControl).getInput();
const lfoWaveform = document.getElementById("lfo-waveform") as HTMLSelectElement;

// Chorus controls
const chorusRate = (document.getElementById("chorus-rate") as RangeControl).getInput();
const chorusDepth = (document.getElementById("chorus-depth") as RangeControl).getInput();
const chorusMix = (document.getElementById("chorus-mix") as RangeControl).getInput();

// Delay controls
const delayTime = (document.getElementById("delay-time") as RangeControl).getInput();
const delayFeedback = (document.getElementById("delay-feedback") as RangeControl).getInput();
const delayMix = (document.getElementById("delay-mix") as RangeControl).getInput();

// Reverb controls
const reverbDecay = (document.getElementById("reverb-decay") as RangeControl).getInput();
const reverbMix = (document.getElementById("reverb-mix") as RangeControl).getInput();

// Compressor controls
const compressorThreshold = (document.getElementById("compressor-threshold") as RangeControl).getInput();
const compressorRatio = (document.getElementById("compressor-ratio") as RangeControl).getInput();
const compressorAttack = (document.getElementById("compressor-attack") as RangeControl).getInput();
const compressorRelease = (document.getElementById("compressor-release") as RangeControl).getInput();
const compressorKnee = (document.getElementById("compressor-knee") as RangeControl).getInput();

// Waveshaper controls
const waveshaperDrive = (document.getElementById("waveshaper-drive") as RangeControl).getInput();
const waveshaperBlend = (document.getElementById("waveshaper-blend") as RangeControl).getInput();

// Master controls
const poly = document.getElementById("poly") as HTMLInputElement;
const masterVolume = (document.getElementById("master-volume") as RangeControl).getInput();

// Record controls
const recordBtn = document.getElementById("record") as HTMLButtonElement;

// Oscillator controls
const oscillatorList = document.getElementById("oscillator-list") as HTMLElement;
const addOscBtn = document.getElementById("add-oscillator") as HTMLButtonElement;

// Initialize modules
const oscillatorBank = new OscillatorBank();
const ampEnvelope = new EnvelopeModule(attack, decay, sustain, release);
const filterEnvelope = new EnvelopeModule(filterAttack, filterDecay, filterSustain, filterRelease);
const filterModule = new FilterModule(filterType, filterCutoff, filterResonance, filterEnvAmount, filterEnvelope);
const lfoModule = new LFOModule(lfoRate, lfoWaveform, lfoToFilter, lfoToPitch);
const chorusModule = new ChorusModule(chorusRate, chorusDepth, chorusMix);
const delayModule = new DelayModule(delayTime, delayFeedback, delayMix);
const masterModule = new MasterModule(masterVolume);
const reverbModule = new ReverbModule(reverbDecay, reverbMix);
const compressorModule = new CompressorModule(
  compressorThreshold,
  compressorRatio,
  compressorAttack,
  compressorRelease,
  compressorKnee
);
const waveShaperModule = new WaveShaperModule(waveshaperDrive, waveshaperBlend);
const voiceManager = new VoiceManager(
  poly,
  oscillatorBank,
  ampEnvelope,
  filterModule,
  lfoModule
);

const synth = new Synth(
  lfoModule,
  chorusModule,
  delayModule,
  masterModule,
  reverbModule,
  voiceManager,
  waveShaperModule,
  compressorModule
);

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
const oscillatorManager = createOscillatorManager(
  oscillatorBank,
  oscillatorList,
  addOscBtn
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

