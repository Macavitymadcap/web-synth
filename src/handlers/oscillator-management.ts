import type { OscillatorBank } from "../core/oscillator-bank";
import type { OscillatorControl } from "../components/organisms/oscillator-bank/oscillator-control";

export function createOscillatorManager(
  oscillatorBank: OscillatorBank,
  oscillatorList: HTMLElement,
  addOscBtn: HTMLButtonElement
) {
  function updateOscillatorConfigs() {
    const configs: Array<{ waveform: OscillatorType; detune: number; level: number }> = [];
    
    const oscControls = oscillatorList.querySelectorAll("oscillator-control");
    oscControls.forEach((control) => {
      configs.push((control as OscillatorControl).getConfig());
    });
    
    oscillatorBank.setConfigs(configs);
  }

  function createOscillatorItem(
    waveform: OscillatorType = "sine",
    detune: number = 0,
    level: number = 1
  ) {
    const oscControl = document.createElement("oscillator-control") as OscillatorControl;
    oscControl.setAttribute("waveform", waveform);
    oscControl.setAttribute("detune", detune.toString());
    oscControl.setAttribute("level", level.toString());
    
    oscControl.addEventListener("configchange", updateOscillatorConfigs);
    
    oscControl.addEventListener("remove", () => {
      if (oscillatorList.children.length > 1) {
        oscControl.remove();
        updateOscillatorConfigs();
      }
    });
    
    return oscControl;
  }

  function initialize() {
    // Initialize with one oscillator
    oscillatorList.appendChild(createOscillatorItem());
    
    // Add button handler
    addOscBtn.addEventListener("click", () => {
      oscillatorList.appendChild(createOscillatorItem());
      updateOscillatorConfigs();
    });
  }

  return {
    initialize,
    updateOscillatorConfigs,
    createOscillatorItem
  };
}