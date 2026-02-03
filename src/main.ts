import { Synth } from "./synth";
import { keyInfo, buildKeyInfo } from "./keys";
import { MidiHandler } from "./midi";
import "./piano-keyboard";

// Get DOM Elements
const poly = document.getElementById("poly") as HTMLInputElement;
const attack = document.getElementById("attack") as HTMLInputElement;
const release = document.getElementById("release") as HTMLInputElement;
const recordBtn = document.getElementById("record") as HTMLButtonElement;
const octaveUpper = document.getElementById("octave-upper") as HTMLSelectElement;
const octaveLower = document.getElementById("octave-lower") as HTMLSelectElement;
const keyboardUpper = document.getElementById("keyboard-upper") as HTMLElement;
const keyboardLower = document.getElementById("keyboard-lower") as HTMLElement;
const midiToggle = document.getElementById("midi-enabled") as HTMLInputElement;
const midiStatus = document.getElementById("midi-status") as HTMLElement;

// Create Synth Instance
const synth = new Synth(poly, attack, release);

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
  
  synth.setOscillatorConfigs(configs);
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

// MIDI Setup
let midiHandler: MidiHandler | null = null;

// Recording Setup
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

// Event Handlers
const keyDownHandler = (ev: KeyboardEvent) => {
  if (ev.repeat) return;
  const k = ev.key.toLowerCase();
  if (!keyInfo[k]) return;
  synth.noteOn(k);
  // Add active class to visual key
  const keyEl = document.querySelector(`[data-key="${k}"]`);
  if (keyEl) keyEl.classList.add("active");
}

const keyUpHandler = (ev: KeyboardEvent) => {
  const k = ev.key.toLowerCase();
  if (!keyInfo[k]) return;
  synth.stopVoice(k);
  // Remove active class from visual key
  const keyEl = document.querySelector(`[data-key="${k}"]`);
  if (keyEl) keyEl.classList.remove("active");
}

const pointerDownHandler = (ev: PointerEvent) => {
  const el = (ev.target as HTMLElement).closest("[data-key]");
  if (!el) return;
  const k = (el as HTMLElement).dataset.key!;
  synth.noteOn(k);
  el.classList.add("active");
  const up = () => {
    synth.stopVoice(k);
    el.classList.remove("active");
    globalThis.removeEventListener("pointerup", up);
    globalThis.removeEventListener("pointercancel", up);
  };
  globalThis.addEventListener("pointerup", up);
  globalThis.addEventListener("pointercancel", up);
}

const recordButtonClickHandler = async () => {
  synth.ensureAudio();
  if (!synth.audioCtx) return;
  
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "Start Recording";
    return;
  }
  
  const dest = synth.audioCtx.createMediaStreamDestination();
  synth.masterGain.connect(dest);
  recordedChunks = [];
  
  mediaRecorder = new MediaRecorder(dest.stream);
  
  mediaRecorder.ondataavailable = e => { 
    if (e.data.size) recordedChunks.push(e.data); 
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = `recording-${Date.now()}.webm`;
    
    // Trigger download
    document.body.appendChild(tempLink);
    tempLink.click();
    
    // Clean up
    setTimeout(() => {
      tempLink.remove();
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  mediaRecorder.start();
  recordBtn.textContent = "Stop Recording";
}

const octaveChangeHandler = () => {
  const upperOct = Number.parseInt(octaveUpper.value);
  const lowerOct = Number.parseInt(octaveLower.value);
  
  // Rebuild the key-to-frequency mapping
  buildKeyInfo(upperOct, lowerOct);
  
  // Update visual keyboards
  keyboardUpper.setAttribute("octave", octaveUpper.value);
  keyboardLower.setAttribute("octave", octaveLower.value);
}

const midiToggleHandler = async () => {
  if (midiToggle.checked) {
    midiHandler ??= new MidiHandler(synth);
    
    const success = await midiHandler.initialize();
    
    if (success) {
      midiStatus.textContent = "✓ MIDI Connected";
      midiStatus.style.color = "#0a0";
    } else {
      midiStatus.textContent = "✗ MIDI Not Available";
      midiStatus.style.color = "#c00";
      midiToggle.checked = false;
    }
  } else {
    if (midiHandler) {
      midiHandler.disconnect();
    }
    midiStatus.textContent = "";
  }
}

// Attach Event Listeners
globalThis.addEventListener("keydown", keyDownHandler);
globalThis.addEventListener("keyup", keyUpHandler);
document.body.addEventListener("pointerdown", pointerDownHandler);
recordBtn.addEventListener("click", recordButtonClickHandler);
octaveUpper.addEventListener("change", octaveChangeHandler);
octaveLower.addEventListener("change", octaveChangeHandler);
midiToggle.addEventListener("change", midiToggleHandler);
