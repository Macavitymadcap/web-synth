export class MasterControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="master-controls" title="Master">
        <div slot="instructions">
          <p>
            Master controls affect connecting external midi devices, the overall synthesiser output and recording
            functionality, allowing you to save your creations as audio files for sharing or further editing.
          </p>

          <instruction-list>
            <instruction-item label="MIDI">Enable MIDI to use an external MIDI keyboard or controller (Desktop
              Chrome/Edge/Opera only - not supported on iOS)</instruction-item>
            <instruction-item label="Polyphonic">Toggle between polyphonic (multiple notes) and monophonic (single note)
              modes</instruction-item>
            <instruction-item label="Master Volume">Overall output volume control (0 - 100%)</instruction-item>
            <instruction-item label="Start Recording">Click the "Start Recording" button to begin capturing audio
              output</instruction-item>
            <instruction-item label="Stop Recording">Click the button again (now "Stop Recording") to end the recording
              session</instruction-item>
            <instruction-item label="Download">After stopping, a download link will appear to save the recorded audio as
              a
              .webm file</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <toggle-switch id="midi-enabled" label-on="MIDI: Connected" label-off="MIDI: Disabled"></toggle-switch>
            <toggle-switch id="poly" label-on="Polyphony: On" label-off="Polyphony: Off" checked></toggle-switch>
            <range-control label="Master Volume" id="master-volume" min="0" max="1" step="0.01" value="0.3"
              formatter="%"></range-control>
            <neon-button id="record" variant="record">Rec ●</neon-button>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('master-controls', MasterControls);