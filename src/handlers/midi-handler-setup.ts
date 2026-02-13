import type { Synth } from "../core/synth";
import { MidiService } from "../services/midi-service";

export function createMidiToggleHandler(
  synth: Synth,
  midiToggle: HTMLInputElement,
) {
  let midiHandler: MidiService | null = null;

  return async () => {
    if (midiToggle.checked) {
      midiHandler ??= new MidiService(synth);
      
      const success = await midiHandler.initialize();
      if (!success) {
        midiToggle.checked = false;
      }
    } else if (midiHandler) {
        midiHandler.disconnect();
      }
  };
}