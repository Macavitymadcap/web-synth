import { NeonSelect } from "../components/atoms/neon-select";
import type { PianoKeyboard } from "../components/organisms/visual-keyboard/piano-keyboard";
import { buildKeyInfo } from "../core/keys";

export function createOctaveChangeHandler(
  octaveUpper: NeonSelect,
  octaveLower: NeonSelect,
  keyboardUpper: PianoKeyboard,
  keyboardLower: PianoKeyboard
) {
  return () => {
    const upper = Number.parseInt(octaveUpper.getSelect().value);
    const lower = Number.parseInt(octaveLower.getSelect().value);
    
    buildKeyInfo(upper, lower);
    
    keyboardUpper.setAttribute("octave", upper.toString());
    keyboardLower.setAttribute("octave", lower.toString());
    
    keyboardUpper.connectedCallback?.();
    keyboardLower.connectedCallback?.();
  };
}