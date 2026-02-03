export class PianoKeyboard extends HTMLElement {
  connectedCallback() {
    const octave = this.getAttribute("octave") || "4";
    const keys = this.getAttribute("keys") || "zxcvbnm,sdghj";
    
    // Parse keys: white keys before comma, black keys after
    const [whiteKeys, blackKeys] = keys.split(",");
    const whiteArray = whiteKeys.split("");
    const blackArray = blackKeys.split("");
    
    // Note names for each white key position (C D E F G A B)
    const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
    
    // Black key positions: after C, after D, skip E, after F, after G, after A, skip B
    const blackPositions = [true, true, false, true, true, true, false];
    
    // Black note names with sharp (♯) and flat (♭) symbols
    const blackNotes = [
      "C♯/D♭",  // after C
      "D♯/E♭",  // after D
      null,     // skip E-F
      "F♯/G♭",  // after F
      "G♯/A♭",  // after G
      "A♯/B♭",  // after A
      null      // skip B-C
    ];
    
    let html = '<div class="keyboard-keys">';
    
    // Generate white keys
    for (let i = 0; i < whiteArray.length && i < 7; i++) {
      const key = whiteArray[i];
      const note = whiteNotes[i];
      html += `
        <div class="key white" data-key="${key}">
          <span class="k-note">${note}${octave}</span>
          <span class="k-label">${key.toUpperCase()}</span>
        </div>
      `;
    }
    
    html += '<div class="black-row">';
    
    // Generate black keys with proper spacing
    let blackIndex = 0;
    for (let i = 0; i < 7; i++) {
      html += '<div class="black-placeholder"></div>';
      
      if (blackPositions[i] && blackIndex < blackArray.length) {
        const key = blackArray[blackIndex];
        const noteName = blackNotes[i];
        html += `
          <div class="key black" data-key="${key}">
            <span class="k-note">${noteName}${octave}</span>
            <span class="k-label">${key.toUpperCase()}</span>
          </div>
        `;
        blackIndex++;
      }
    }
    
    html += '</div></div>';
    
    this.innerHTML = html;
  }
}

customElements.define("piano-keyboard", PianoKeyboard);