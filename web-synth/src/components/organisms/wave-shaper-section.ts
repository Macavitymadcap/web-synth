   // src/modules/wave-shaper-module.ts
   export type WaveShaperConfig = {
     curve: Float32Array;
     oversample: 'none' | '2x' | '4x';
   };

   export type WaveShaperNodes = {
     input: GainNode;
     output: GainNode;
   };

   export class WaveShaperModule {
     private readonly curveEl: HTMLInputElement;
     private readonly oversampleEl: HTMLSelectElement;

     private waveShaperNode: WaveShaperNode | null = null;
     private inputGain: GainNode | null = null;
     private outputGain: GainNode | null = null;

     constructor(curveEl: HTMLInputElement, oversampleEl: HTMLSelectElement) {
       this.curveEl = curveEl;
       this.oversampleEl = oversampleEl;

       this.setupParameterListeners();
     }

     getConfig(): WaveShaperConfig {
       const curve = new Float32Array(JSON.parse(this.curveEl.value));
       const oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
       return { curve, oversample };
     }

     initialize(audioCtx: AudioContext, destination: AudioNode): WaveShaperNodes {
       const { curve, oversample } = this.getConfig();

       this.waveShaperNode = audioCtx.createWaveShaper();
       this.waveShaperNode.curve = curve;
       this.waveShaperNode.oversample = oversample;

       this.inputGain = audioCtx.createGain();
       this.outputGain = audioCtx.createGain();

       this.inputGain.connect(this.waveShaperNode);
       this.waveShaperNode.connect(this.outputGain);
       this.outputGain.connect(destination);

       return {
         input: this.inputGain,
         output: this.outputGain,
       };
     }

     private setupParameterListeners(): void {
       this.curveEl.addEventListener('input', () => {
         if (this.waveShaperNode) {
           this.waveShaperNode.curve = new Float32Array(JSON.parse(this.curveEl.value));
         }
       });

       this.oversampleEl.addEventListener('change', () => {
         if (this.waveShaperNode) {
           this.waveShaperNode.oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
         }
       });
     }

     isInitialized(): boolean {
       return this.waveShaperNode !== null;
     }
   }