# Stereo Panner/Width
**Status**: Not implemented  
**Priority**: Low  
**Complexity**: Low

## Description
Control stereo positioning and width for creating spatial depth in mixes. Uses `StereoPannerNode` for left-right positioning and width control for enhancing stereo image. Essential for mixing multiple voices, creating movement, and adding professional spatial characteristics to sounds.

## Implementation Plan

**1. Create Stereo Panner Module** (`src/modules/stereo-panner-module.ts`):

````typescript
export type StereoPannerConfig = {
  enabled: boolean;
  pan: number;      // -1 (left) to +1 (right)
  width: number;    // 0 (mono) to 1 (full stereo)
};

export type StereoPannerNodes = {
  input: GainNode;
  output: GainNode;
};

export class StereoPannerModule {
  private readonly enabledEl: HTMLInputElement;
  private readonly panEl: HTMLInputElement;
  private readonly widthEl: HTMLInputElement;
  
  private panner: StereoPannerNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  
  constructor(
    enabledEl: HTMLInputElement,
    panEl: HTMLInputElement,
    widthEl: HTMLInputElement
  ) {
    this.enabledEl = enabledEl;
    this.panEl = panEl;
    this.widthEl = widthEl;
    this.setupParameterListeners();
  }
  
  getConfig(): StereoPannerConfig {
    return {
      enabled: this.enabledEl.checked,
      pan: parseFloat(this.panEl.value),
      width: parseFloat(this.widthEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): StereoPannerNodes {
    const { enabled, pan, width } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    
    // Create stereo panner for left-right positioning
    this.panner = audioCtx.createStereoPanner();
    this.panner.pan.value = pan;
    
    // Create width control (stereo enhancement)
    this.splitter = audioCtx.createChannelSplitter(2);
    this.merger = audioCtx.createChannelMerger(2);
    
    this.leftGain = audioCtx.createGain();
    this.rightGain = audioCtx.createGain();
    
    // Calculate gains for width control
    // width = 0: mono (equal mix of L+R to both channels)
    // width = 1: full stereo (100% L to left, 100% R to right)
    this.updateWidthGains(width);
    
    if (enabled) {
      // Wire up: input → panner → splitter → gains → merger → output
      this.inputGain.connect(this.panner);
      this.panner.connect(this.splitter);
      
      // Left channel processing
      this.splitter.connect(this.leftGain, 0);
      this.leftGain.connect(this.merger, 0, 0);
      
      // Right channel processing
      this.splitter.connect(this.rightGain, 1);
      this.rightGain.connect(this.merger, 0, 1);
      
      // Also add cross-feed for width < 1
      const leftCrossfeedGain = audioCtx.createGain();
      const rightCrossfeedGain = audioCtx.createGain();
      
      leftCrossfeedGain.gain.value = (1 - width) * 0.5;
      rightCrossfeedGain.gain.value = (1 - width) * 0.5;
      
      this.splitter.connect(leftCrossfeedGain, 0);
      leftCrossfeedGain.connect(this.merger, 0, 1);
      
      this.splitter.connect(rightCrossfeedGain, 1);
      rightCrossfeedGain.connect(this.merger, 0, 0);
      
      this.merger.connect(this.outputGain);
    } else {
      // Bypass: direct connection
      this.inputGain.connect(this.outputGain);
    }
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  /**
   * Update channel gains based on width parameter
   * @private
   */
  private updateWidthGains(width: number): void {
    if (!this.leftGain || !this.rightGain) return;
    
    // At width = 0, both channels get equal mix
    // At width = 1, each channel gets only its signal
    const channelGain = 0.5 + (width * 0.5);
    const crossfeed = 1 - width;
    
    this.leftGain.gain.value = channelGain;
    this.rightGain.gain.value = channelGain;
  }
  
  /**
   * Reconfigure routing when enable state changes
   * @private
   */
  private reconfigure(): void {
    if (!this.inputGain || !this.outputGain) return;
    
    const { enabled } = this.getConfig();
    
    // Disconnect everything
    this.inputGain.disconnect();
    if (this.panner) this.panner.disconnect();
    if (this.merger) this.merger.disconnect();
    
    if (enabled) {
      // Reconnect with processing
      if (this.panner && this.splitter && this.leftGain && this.rightGain && this.merger) {
        this.inputGain.connect(this.panner);
        this.panner.connect(this.splitter);
        
        this.splitter.connect(this.leftGain, 0);
        this.leftGain.connect(this.merger, 0, 0);
        
        this.splitter.connect(this.rightGain, 1);
        this.rightGain.connect(this.merger, 0, 1);
        
        this.merger.connect(this.outputGain);
      }
    } else {
      // Bypass
      this.inputGain.connect(this.outputGain);
    }
  }
  
  /**
   * Setup event listeners for parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.enabledEl.addEventListener('change', () => {
      this.reconfigure();
    });
    
    this.panEl.addEventListener('input', () => {
      if (this.panner) {
        this.panner.pan.value = parseFloat(this.panEl.value);
      }
    });
    
    this.widthEl.addEventListener('input', () => {
      const width = parseFloat(this.widthEl.value);
      this.updateWidthGains(width);
    });
  }
  
  isInitialized(): boolean {
    return this.panner !== null;
  }
}