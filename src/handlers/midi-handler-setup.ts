import type { Synth } from "../core/synth";
import { MidiHandler } from "../audio/midi";

export function createMidiToggleHandler(
  synth: Synth,
  midiToggle: HTMLInputElement,
) {
  let midiHandler: MidiHandler | null = null;

  return async () => {
    if (midiToggle.checked) {
      midiHandler ??= new MidiHandler(synth);
      
      const success = await midiHandler.initialize();
      if (!success) {
        midiToggle.checked = false;
      }
    } else if (midiHandler) {
        midiHandler.disconnect();
      }
  };
}