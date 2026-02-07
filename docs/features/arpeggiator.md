# Arpeggiator
**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Medium

## Description
Automatically cycles through held notes in various patterns and directions. Classic synthesizer feature that creates rhythmic melodic patterns from sustained chords. Essential for electronic music genres and adding movement to static chord progressions.

## Implementation Plan

**1. Create Arpeggiator Module** (`src/modules/arpeggiator-module.ts`):

````typescript
export type ArpPattern = 'up' | 'down' | 'updown' | 'downup' | 'random' | 'chord';

export type ArpConfig = {
  enabled: boolean;
  pattern: ArpPattern;
  rate: number;        // Steps per second
  octaves: number;     // Number of octaves to span (1-4)
  gateLength: number;  // Note duration as fraction of step (0-1)
};

export class ArpeggiatorModule {
  private readonly enabledEl: HTMLInputElement;
  private readonly patternEl: HTMLSelectElement;
  private readonly rateEl: HTMLInputElement;
  private readonly octavesEl: HTMLInputElement;
  private readonly gateLengthEl: HTMLInputElement;
  
  private heldNotes: Set<string> = new Set();
  private currentStep: number = 0;
  private intervalId: number | null = null;
  private noteSequence: Array<{ key: string; freq: number }> = [];
  
  constructor(
    enabledEl: HTMLInputElement,
    patternEl: HTMLSelectElement,
    rateEl: HTMLInputElement,
    octavesEl: HTMLInputElement,
    gateLengthEl: HTMLInputElement
  ) {
    this.enabledEl = enabledEl;
    this.patternEl = patternEl;
    this.rateEl = rateEl;
    this.octavesEl = octavesEl;
    this.gateLengthEl = gateLengthEl;
    this.setupEventListeners();
  }
  
  getConfig(): ArpConfig {
    return {
      enabled: this.enabledEl.checked,
      pattern: this.patternEl.value as ArpPattern,
      rate: parseFloat(this.rateEl.value),
      octaves: parseInt(this.octavesEl.value),
      gateLength: parseFloat(this.gateLengthEl.value)
    };
  }
  
  isEnabled(): boolean {
    return this.getConfig().enabled;
  }
  
  /**
   * Add a note to the arpeggiator's held notes
   * @param key - Unique identifier for the note
   * @param freq - Base frequency of the note
   */
  addNote(key: string, freq: number): void {
    this.heldNotes.add(key);
    this.updateSequence();
    
    if (this.heldNotes.size === 1) {
      this.start();
    }
  }
  
  /**
   * Remove a note from the arpeggiator's held notes
   * @param key - Unique identifier for the note
   */
  removeNote(key: string): void {
    this.heldNotes.delete(key);
    this.updateSequence();
    
    if (this.heldNotes.size === 0) {
      this.stop();
    }
  }
  
  /**
   * Get the current step's note
   * @returns The note to play, or null if no notes held
   */
  getCurrentNote(): { key: string; freq: number } | null {
    if (this.noteSequence.length === 0) return null;
    return this.noteSequence[this.currentStep];
  }
  
  /**
   * Advance to the next step
   */
  advanceStep(): void {
    this.currentStep = (this.currentStep + 1) % this.noteSequence.length;
  }
  
  /**
   * Reset the arpeggiator sequence
   */
  reset(): void {
    this.currentStep = 0;
    this.updateSequence();
  }
  
  /**
   * Start the arpeggiator clock
   * @private
   */
  private start(): void {
    if (this.intervalId !== null) return;
    
    const { rate } = this.getConfig();
    const intervalMs = 1000 / rate;
    
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, intervalMs);
  }
  
  /**
   * Stop the arpeggiator clock
   * @private
   */
  private stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentStep = 0;
  }
  
  /**
   * Process one arpeggiator step
   * @private
   */
  private tick(): void {
    // Callback will be set by handler
    // This triggers note on/off events
    this.advanceStep();
  }
  
  /**
   * Update the note sequence based on held notes and pattern
   * @private
   */
  private updateSequence(): void {
    const { pattern, octaves } = this.getConfig();
    
    // Get base notes sorted by frequency
    const baseNotes = Array.from(this.heldNotes).map(key => {
      const freq = this.getFrequencyForKey(key);
      return { key, freq };
    }).sort((a, b) => a.freq - b.freq);
    
    if (baseNotes.length === 0) {
      this.noteSequence = [];
      return;
    }
    
    // Build sequence with octave multiplication
    let sequence: Array<{ key: string; freq: number }> = [];
    
    for (let octave = 0; octave < octaves; octave++) {
      const octaveMultiplier = Math.pow(2, octave);
      for (const note of baseNotes) {
        sequence.push({
          key: `${note.key}_oct${octave}`,
          freq: note.freq * octaveMultiplier
        });
      }
    }
    
    // Apply pattern
    switch (pattern) {
      case 'up':
        // Already sorted ascending
        break;
      case 'down':
        sequence.reverse();
        break;
      case 'updown':
        sequence = [...sequence, ...sequence.slice(0, -1).reverse()];
        break;
      case 'downup':
        const reversed = [...sequence].reverse();
        sequence = [...reversed, ...reversed.slice(0, -1).reverse()];
        break;
      case 'random':
        // Shuffle the sequence
        for (let i = sequence.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        break;
      case 'chord':
        // Play all notes simultaneously (sequence of length 1)
        sequence = [{ 
          key: 'chord', 
          freq: baseNotes[0].freq // Representative freq
        }];
        break;
    }
    
    this.noteSequence = sequence;
    
    // Reset step if current step is out of bounds
    if (this.currentStep >= this.noteSequence.length) {
      this.currentStep = 0;
    }
  }
  
  /**
   * Get frequency for a key (stub - should integrate with keyInfo)
   * @private
   */
  private getFrequencyForKey(key: string): number {
    // This should reference the keyInfo mapping from keys.ts
    // For now, return placeholder
    return 440;
  }
  
  /**
   * Setup event listeners for parameter changes
   * @private
   */
  private setupEventListeners(): void {
    this.enabledEl.addEventListener('change', () => {
      if (!this.getConfig().enabled && this.intervalId !== null) {
        this.stop();
      }
    });
    
    this.patternEl.addEventListener('change', () => {
      this.updateSequence();
      this.currentStep = 0;
    });
    
    this.rateEl.addEventListener('input', () => {
      // Restart with new rate
      if (this.intervalId !== null) {
        this.stop();
        this.start();
      }
    });
    
    this.octavesEl.addEventListener('input', () => {
      this.updateSequence();
      this.currentStep = 0;
    });
  }
  
  /**
   * Get the gate length for note duration
   */
  getGateLength(): number {
    return this.getConfig().gateLength;
  }
}