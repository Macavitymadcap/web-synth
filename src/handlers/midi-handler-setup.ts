import type { Synth } from "../core/synth";
import { MidiHandler } from "../audio/midi";

export function createMidiToggleHandler(
  synth: Synth,
  midiToggle: HTMLInputElement,
  midiStatus: HTMLElement
) {
  let midiHandler: MidiHandler | null = null;

  return async () => {
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
}