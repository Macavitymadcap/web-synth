import { Synth } from "./synth";
import { OscillatorBank } from "./oscillator-bank";
import { EnvelopeModule } from "./modules/envelope-module";
import { FilterModule } from "./modules/filter-module";
import { LFOModule } from "./modules/lfo-module";
import { DelayModule } from "./modules/delay-module";
import { MasterModule } from "./modules/master-module";
import { VoiceManager } from "./modules/voice-manager";
import { buildKeyInfo } from "./keys";
import { MidiHandler } from "./midi";
import "./components/piano-keyboard";
import type { PianoKeyboard } from "./components/piano-keyboard";
import "./components/range-control";
import type { RangeControl } from "./components/range-control";
import "./components/oscillator-control";
import type { OscillatorControl } from "./components/oscillator-control";

// Keyboard and MIDI controls
const octaveUpper = document.getElementById("octave-upper") as HTMLSelectElement;
const octaveLower = document.getElementById("octave-lower") as HTMLSelectElement;
const keyboardUpper = document.getElementById("keyboard-upper") as PianoKeyboard;
const keyboardLower = document.getElementById("keyboard-lower") as PianoKeyboard;
const midiToggle = document.getElementById("midi-enabled") as HTMLInputElement;
const midiStatus = document.getElementById("midi-status") as HTMLElement;

// ASDR controls
const attack = (document.getElementById("attack") as RangeControl).getInput();
const decay = (document.getElementById("decay") as RangeControl).getInput();
const sustain = (document.getElementById("sustain") as RangeControl).getInput();
const release = (document.getElementById("release") as RangeControl).getInput();

// Filter controls
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

// Delay controls
const delayTime = (document.getElementById("delay-time") as RangeControl).getInput();
const delayFeedback = (document.getElementById("delay-feedback") as RangeControl).getInput();
const delayMix = (document.getElementById("delay-mix") as RangeControl).getInput();

// Master controls
const poly = document.getElementById("poly") as HTMLInputElement;
const masterVolume = (document.getElementById("master-volume") as RangeControl).getInput();

// Record controls
const recordBtn = document.getElementById("record") as HTMLButtonElement;

const oscillatorBank = new OscillatorBank();
const ampEnvelope = new EnvelopeModule(attack, decay, sustain, release);
const filterEnvelope = new EnvelopeModule(filterAttack, filterDecay, filterSustain, filterRelease);
const filterModule = new FilterModule(filterCutoff, filterResonance, filterEnvAmount, filterEnvelope);
const lfoModule = new LFOModule(lfoRate, lfoWaveform, lfoToFilter, lfoToPitch);
const delayModule = new DelayModule(delayTime, delayFeedback, delayMix);
const masterModule = new MasterModule(masterVolume);
const voiceManager = new VoiceManager(
  poly,
  oscillatorBank,
  ampEnvelope,
  filterModule,
  lfoModule
);

const synth = new Synth(
  lfoModule,
  delayModule,
  masterModule,
  voiceManager
);

// Oscillator management
const oscillatorList = document.getElementById("oscillator-list") as HTMLElement;
const addOscBtn = document.getElementById("add-oscillator") as HTMLButtonElement;

function updateOscillatorConfigs() {
  const configs: Array<{ waveform: OscillatorType; detune: number; level: number }> = [];
  
  const oscControls = oscillatorList.querySelectorAll("oscillator-control");
  oscControls.forEach((control) => {
    configs.push((control as OscillatorControl).getConfig());
  });
  
  oscillatorBank.setConfigs(configs);
}

function createOscillatorItem(waveform: OscillatorType = "sine", detune: number = 0, level: number = 1) {
  const oscControl = document.createElement("oscillator-control") as OscillatorControl;
  oscControl.setAttribute("waveform", waveform);
  oscControl.setAttribute("detune", detune.toString());
  oscControl.setAttribute("level", level.toString());
  
  // Listen for config changes
  oscControl.addEventListener("configchange", updateOscillatorConfigs);
  
  // Listen for remove events
  oscControl.addEventListener("remove", () => {
    if (oscillatorList.children.length > 1) {
      oscControl.remove();
      updateOscillatorConfigs();
    }
  });
  
  return oscControl;
}

// Initialize with one oscillator
oscillatorList.appendChild(createOscillatorItem());

addOscBtn.addEventListener("click", () => {
  oscillatorList.appendChild(createOscillatorItem());
  updateOscillatorConfigs();
});

// MIDI Setup
let midiHandler: MidiHandler | null = null;

// Recording Setup
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

// Event Handlers
const keyDownHandler = (ev: KeyboardEvent) => {
  if (ev.repeat) return;
  
  // Find and highlight the key visually
  const keyElement = document.querySelector(`[data-key="${ev.key}"]`);
  if (keyElement) {
    keyElement.classList.add("active");
  }
  
  synth.noteOn(ev.key);
};

const keyUpHandler = (ev: KeyboardEvent) => {
  // Remove highlight from the key
  const keyElement = document.querySelector(`[data-key="${ev.key}"]`);
  if (keyElement) {
    keyElement.classList.remove("active");
  }
  
  synth.stopVoice(ev.key);
};

const pointerDownHandler = (ev: PointerEvent) => {
  const target = ev.target as HTMLElement;
  
  // Check if we clicked on a key or a child element of a key
  const keyElement = target.closest(".key") as HTMLElement;
  if (!keyElement) return;
  
  const key = keyElement.dataset.key;
  if (key) {
    keyElement.classList.add("active");
    synth.noteOn(key);
  }
};

const pointerUpHandler = (ev: PointerEvent) => {
  const target = ev.target as HTMLElement;
  
  // Check if we released on a key or a child element of a key
  const keyElement = target.closest(".key") as HTMLElement;
  if (!keyElement) return;
  
  const key = keyElement.dataset.key;
  if (key) {
    keyElement.classList.remove("active");
    synth.stopVoice(key);
  }
};

const recordButtonClickHandler = async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    synth.ensureAudio();
    if (!synth.audioCtx) return;
    
    const dest = synth.audioCtx.createMediaStreamDestination();
    synth.masterGain.connect(dest);
    
    mediaRecorder = new MediaRecorder(dest.stream);
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) {
        recordedChunks.push(ev.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `synth-recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    mediaRecorder.start();
    recordBtn.textContent = "Stop Recording";
  } else {
    mediaRecorder.stop();
    recordBtn.textContent = "Start Recording";
  }
};

const octaveChangeHandler = () => {
  const upper = Number.parseInt(octaveUpper.value);
  const lower = Number.parseInt(octaveLower.value);
  
  buildKeyInfo(upper, lower);
  
  keyboardUpper.setAttribute("octave", upper.toString());
  keyboardLower.setAttribute("octave", lower.toString());
  
  keyboardUpper.connectedCallback?.();
  keyboardLower.connectedCallback?.();
};

const midiToggleHandler = async () => {
  if (midiToggle.checked) {
    midiHandler ??= new MidiHandler(synth);
    
    const success = await midiHandler.initialize();
    if (success) {
      midiStatus.textContent = "✓ MIDI Connected";
      midiStatus.style.color = "#28a745";
    } else {
      midiStatus.textContent = "✗ MIDI Not Available";
      midiStatus.style.color = "#dc3545";
      midiToggle.checked = false;
    }
  } else {
    if (midiHandler) {
      midiHandler.disconnect();
    }
    midiStatus.textContent = "";
  }
};

// Attach Event Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("pointerdown", pointerDownHandler);
document.addEventListener("pointerup", pointerUpHandler);

recordBtn.addEventListener("click", recordButtonClickHandler);
octaveUpper.addEventListener("change", octaveChangeHandler);
octaveLower.addEventListener("change", octaveChangeHandler);
midiToggle.addEventListener("change", midiToggleHandler);
