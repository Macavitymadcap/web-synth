export class MidiHandler {
  private readonly synth: any;
  private midiAccess: MIDIAccess | null = null;
  private readonly activeNotes: Map<number, string> = new Map();
  
  constructor(synth: any) {
    this.synth = synth;
  }

  async initialize(): Promise<boolean> {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupInputs();
      return true;
    } catch (err) {
      console.error("Failed to get MIDI access", err);
      return false;
    }
  }

  private setupInputs() {
    if (!this.midiAccess) return;

    this.midiAccess.inputs.forEach((input) => {
      input.onmidimessage = this.handleMidiMessage.bind(this);
    });

    // Handle hot-plugging
    this.midiAccess.onstatechange = (e: any) => {
      if (e.port.type === "input" && e.port.state === "connected") {
        e.port.onmidimessage = this.handleMidiMessage.bind(this);
      }
    };
  }

  private handleMidiMessage(event: MIDIMessageEvent) {
    if (!event.data) return;
    const [status, note, velocity] = event.data;
    const command = status & 0xf0;

    if (command === 0x90 && velocity > 0) {
      // Note On
      this.noteOn(note, velocity);
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      // Note Off
      this.noteOff(note);
    }
  }

  private noteOn(midiNote: number, velocity: number) {
    // Generate a unique key for this MIDI note
    const key = `midi_${midiNote}`;
    
    // Calculate frequency from MIDI note number
    // A4 (440Hz) = MIDI note 69
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    this.synth.playFrequency(key, freq, velocity / 127);
    this.activeNotes.set(midiNote, key);
  }

  private noteOff(midiNote: number) {
    const key = this.activeNotes.get(midiNote);
    if (key) {
      this.synth.stopVoice(key);
      this.activeNotes.delete(midiNote);
    }
  }

  disconnect() {
    if (this.midiAccess) {
      this.midiAccess.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    }
    
    // Stop all active MIDI notes
    for (const key of this.activeNotes.values()) {
      this.synth.stopVoice(key);
    }
    this.activeNotes.clear();
  }
}