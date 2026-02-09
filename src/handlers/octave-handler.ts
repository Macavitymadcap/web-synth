import type { PianoKeyboard } from "../components/organisms/visual-keyboard/piano-keyboard";
import { buildKeyInfo } from "../core/keys";

export function createOctaveChangeHandler(
  octaveUpper: HTMLSelectElement,
  octaveLower: HTMLSelectElement,
  keyboardUpper: PianoKeyboard,
  keyboardLower: PianoKeyboard
) {
  return () => {
    const upper = Number.parseInt(octaveUpper.value);
    const lower = Number.parseInt(octaveLower.value);
    
    buildKeyInfo(upper, lower);
    
    keyboardUpper.setAttribute("octave", upper.toString());
    keyboardLower.setAttribute("octave", lower.toString());
    
    keyboardUpper.connectedCallback?.();
    keyboardLower.connectedCallback?.();
  };
}