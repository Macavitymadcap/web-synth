import type { Synth } from "../core/synth";

export function createKeyboardHandlers(synth: Synth) {
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

  return {
    keyDownHandler,
    keyUpHandler,
    pointerDownHandler,
    pointerUpHandler
  };
}