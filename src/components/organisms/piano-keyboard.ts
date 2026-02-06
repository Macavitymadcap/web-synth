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
    
    let html = `
      ${this.createStyles()}
      <div class="keyboard-keys">
    `;
    
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

  private createStyles(): string {
    return `
      <style>
        .keyboard {
          position: relative;
          width: 100%;
          display: flex;
          gap: 6px;
          height: 120px;
          margin-bottom: 18px;
        }

        .key {
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
        }

        .key.white {
          flex: 1 1 0;
          background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
          border: 2px solid var(--neon-cyan);
          border-radius: 6px;
          box-shadow: 
            0 0 10px rgba(0, 255, 255, 0.3),
            0 6px 0 rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          padding: 8px 4px;
          position: relative;
          z-index: 1;
          user-select: none;
          transition: all 0.05s ease;
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
        }

        .key.white:hover {
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.6),
            0 6px 0 rgba(0, 0, 0, 0.1);
        }

        .key.white .k-label {
          font-weight: 700;
          font-size: 12px;
        }

        .key.white .k-note {
          font-size: 12px;
          opacity: 0.85;
          margin-bottom: 4px;
        }

        /* black row overlay container - positioned absolute on top of white keys */
        .black-row {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 70px;
          display: flex;
          gap: 6px;
          padding: 0 3px;
          pointer-events: none;
          /* so pointer goes to whites unless black is present */
          z-index: 2;
        }

        /* placeholder in black row where no black key exists */
        .black-placeholder {
          flex: 1 1 0;
        }

        /* black key styling */
        .key.black {
          width: calc(100% / 10);
          margin-left: -8px;
          margin-right: -8px;
          background: linear-gradient(180deg, #1a0033 0%, #0a0015 100%);
          color: var(--neon-pink);
          border: 2px solid var(--neon-pink);
          border-radius: 6px;
          box-shadow: 
            0 0 15px rgba(255, 0, 255, 0.5),
            inset 0 0 10px rgba(255, 0, 255, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding-top: 6px;
          pointer-events: auto;
          transition: all 0.05s ease;
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
          text-shadow: 0 0 5px var(--neon-pink);
        }

        .key.black:hover {
          box-shadow: 
            0 0 25px rgba(255, 0, 255, 0.8),
            inset 0 0 15px rgba(255, 0, 255, 0.3);
        }

        .key.black .k-note {
          font-size: 9px;
          opacity: 0.85;
          margin-bottom: 4px;
          text-align: center;
          line-height: 1.2;
        }

        .key.black .k-label {
          font-weight: 700;
          font-size: 11px;
        }

        /* active states */
        .key.active.white {
          background: #f5f5f5;
          box-shadow: 0 2px 0 rgba(0, 0, 0, 0.08) inset;
          transform: translateY(4px);
          transition: transform 0.05s ease, box-shadow 0.05s ease;
        }

        .key.black.active {
          background: linear-gradient(#2b2b2b, #101010);
          transform: translateY(2px);
          transition: transform 0.05s ease;
        }

        .keyboard-keys {
          position: relative;
          width: 100%;
          display: flex;
          gap: 6px;
          height: 120px;
          margin-bottom: 18px;
        }
      </style>
    `;
  }
}

customElements.define("piano-keyboard", PianoKeyboard);