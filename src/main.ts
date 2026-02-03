import { Synth } from "./synth";
import { OscillatorBank } from "./oscillator-bank";
import { buildKeyInfo } from "./keys";
import { MidiHandler } from "./midi";
import "./piano-keyboard";

// Get DOM Elements
const poly = document.getElementById("poly") as HTMLInputElement;
const attack = document.getElementById("attack") as HTMLInputElement;
const decay = document.getElementById("decay") as HTMLInputElement;
const sustain = document.getElementById("sustain") as HTMLInputElement;
const release = document.getElementById("release") as HTMLInputElement;

// Filter controls
const filterCutoff = document.getElementById("filter-cutoff") as HTMLInputElement;
const filterResonance = document.getElementById("filter-resonance") as HTMLInputElement;
const filterEnvAmount = document.getElementById("filter-env-amount") as HTMLInputElement;
const filterAttack = document.getElementById("filter-attack") as HTMLInputElement;
const filterDecay = document.getElementById("filter-decay") as HTMLInputElement;
const filterSustain = document.getElementById("filter-sustain") as HTMLInputElement;
const filterRelease = document.getElementById("filter-release") as HTMLInputElement;

// LFO controls
const lfoRate = document.getElementById("lfo-rate") as HTMLInputElement;
const lfoToFilter = document.getElementById("lfo-to-filter") as HTMLInputElement;
const lfoToPitch = document.getElementById("lfo-to-pitch") as HTMLInputElement;
const lfoWaveform = document.getElementById("lfo-waveform") as HTMLSelectElement;

// Delay controls
const delayTime = document.getElementById("delay-time") as HTMLInputElement;
const delayFeedback = document.getElementById("delay-feedback") as HTMLInputElement;
const delayMix = document.getElementById("delay-mix") as HTMLInputElement;

// Master volume
const masterVolume = document.getElementById("master-volume") as HTMLInputElement;

const recordBtn = document.getElementById("record") as HTMLButtonElement;
const octaveUpper = document.getElementById("octave-upper") as HTMLSelectElement;
const octaveLower = document.getElementById("octave-lower") as HTMLSelectElement;
const keyboardUpper = document.getElementById("keyboard-upper") as HTMLElement;
const keyboardLower = document.getElementById("keyboard-lower") as HTMLElement;
const midiToggle = document.getElementById("midi-enabled") as HTMLInputElement;
const midiStatus = document.getElementById("midi-status") as HTMLElement;

// Create Oscillator Bank
const oscillatorBank = new OscillatorBank();

// Create Synth Instance with dependency injection
const synth = new Synth({
  oscillatorBank,
  polyEl: poly,
  attackEl: attack,
  decayEl: decay,
  sustainEl: sustain,
  releaseEl: release,
  filterCutoffEl: filterCutoff,
  filterResonanceEl: filterResonance,
  filterEnvAmountEl: filterEnvAmount,
  filterAttackEl: filterAttack,
  filterDecayEl: filterDecay,
  filterSustainEl: filterSustain,
  filterReleaseEl: filterRelease,
  lfoRateEl: lfoRate,
  lfoToFilterEl: lfoToFilter,
  lfoToPitchEl: lfoToPitch,
  lfoWaveformEl: lfoWaveform,
  delayTimeEl: delayTime,
  delayFeedbackEl: delayFeedback,
  delayMixEl: delayMix,
  masterVolumeEl: masterVolume
});

// Oscillator management
const oscillatorList = document.getElementById("oscillator-list") as HTMLElement;
const addOscBtn = document.getElementById("add-oscillator") as HTMLButtonElement;

function updateOscillatorConfigs() {
  const configs: Array<{ waveform: OscillatorType; detune: number; level: number }> = [];
  
  const oscItems = oscillatorList.querySelectorAll(".oscillator-item");
  oscItems.forEach((item) => {
    const waveSelect = item.querySelector(".osc-wave") as HTMLSelectElement;
    const detuneInput = item.querySelector(".osc-detune") as HTMLInputElement;
    const levelInput = item.querySelector(".osc-level") as HTMLInputElement;
    
    configs.push({
      waveform: waveSelect.value as OscillatorType,
      detune: Number.parseFloat(detuneInput.value),
      level: Number.parseFloat(levelInput.value)
    });
  });
  
  oscillatorBank.setConfigs(configs);
}

function createOscillatorItem(waveform: OscillatorType = "sine", detune: number = 0, level: number = 1) {
  const item = document.createElement("div");
  item.className = "oscillator-item";
  
  item.innerHTML = `
    <label>
      Waveform
      <select class="osc-wave">
        <option value="sine" ${waveform === "sine" ? "selected" : ""}>Sine</option>
        <option value="square" ${waveform === "square" ? "selected" : ""}>Square</option>
        <option value="sawtooth" ${waveform === "sawtooth" ? "selected" : ""}>Sawtooth</option>
        <option value="triangle" ${waveform === "triangle" ? "selected" : ""}>Triangle</option>
      </select>
    </label>
    
    <label>
      Detune
      <input type="range" class="osc-detune" min="-1200" max="1200" step="1" value="${detune}">
      <span class="detune-value">${detune} cents</span>
    </label>
    
    <label>
      Level
      <input type="range" class="osc-level" min="0" max="1" step="0.01" value="${level}">
      <span class="level-value">${(level * 100).toFixed(0)}%</span>
    </label>
    
    <button class="remove-osc">Remove</button>
  `;
  
  const waveSelect = item.querySelector(".osc-wave") as HTMLSelectElement;
  const detuneInput = item.querySelector(".osc-detune") as HTMLInputElement;
  const levelInput = item.querySelector(".osc-level") as HTMLInputElement;
  const detuneValue = item.querySelector(".detune-value") as HTMLSpanElement;
  const levelValue = item.querySelector(".level-value") as HTMLSpanElement;
  const removeBtn = item.querySelector(".remove-osc") as HTMLButtonElement;
  
  waveSelect.addEventListener("change", updateOscillatorConfigs);
  
  detuneInput.addEventListener("input", () => {
    detuneValue.textContent = `${detuneInput.value} cents`;
    updateOscillatorConfigs();
  });
  
  levelInput.addEventListener("input", () => {
    levelValue.textContent = `${(Number.parseFloat(levelInput.value) * 100).toFixed(0)}%`;
    updateOscillatorConfigs();
  });
  
  removeBtn.addEventListener("click", () => {
    if (oscillatorList.children.length > 1) {
      item.remove();
      updateOscillatorConfigs();
    }
  });
  
  return item;
}

// Initialize with one oscillator
oscillatorList.appendChild(createOscillatorItem());

addOscBtn.addEventListener("click", () => {
  oscillatorList.appendChild(createOscillatorItem());
  updateOscillatorConfigs();
});

// Add value display updates for all range inputs
function setupRangeDisplay(inputId: string, suffix: string = "", multiplier: number = 1) {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const display = document.getElementById(`${inputId}-value`) as HTMLSpanElement;
  
  if (input && display) {
    const updateDisplay = () => {
      const value = Number.parseFloat(input.value) * multiplier;
      display.textContent = `${value.toFixed(multiplier === 1 ? 0 : 2)}${suffix}`;
    };
    
    input.addEventListener('input', updateDisplay);
    updateDisplay(); // Initial display
  }
}

// Setup all range displays
setupRangeDisplay('attack', 's');
setupRangeDisplay('decay', 's');
setupRangeDisplay('sustain', '%', 100);
setupRangeDisplay('release', 's');

setupRangeDisplay('filter-cutoff', ' Hz');
setupRangeDisplay('filter-resonance');
setupRangeDisplay('filter-env-amount', ' Hz');
setupRangeDisplay('filter-attack', 's');
setupRangeDisplay('filter-decay', 's');
setupRangeDisplay('filter-sustain', '%', 100);
setupRangeDisplay('filter-release', 's');

setupRangeDisplay('lfo-rate', ' Hz');
setupRangeDisplay('lfo-to-filter', ' Hz');
setupRangeDisplay('lfo-to-pitch', ' cents');

setupRangeDisplay('delay-time', 's');
setupRangeDisplay('delay-feedback', '%', 100);
setupRangeDisplay('delay-mix', '%', 100);

setupRangeDisplay('master-volume', '%', 100);

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
  
  (keyboardUpper as any).connectedCallback?.();
  (keyboardLower as any).connectedCallback?.();
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
