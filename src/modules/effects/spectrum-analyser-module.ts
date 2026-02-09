export class SpectrumAnalyserModule {
  private analyserNode: AnalyserNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private animationFrame: number | null = null;
  private canvas: HTMLCanvasElement | null = null;

  initialize(audioCtx: AudioContext, destination: AudioNode, canvas: HTMLCanvasElement) {
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.analyserNode = audioCtx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.inputGain.connect(this.analyserNode);
    this.analyserNode.connect(this.outputGain);

    this.canvas = canvas;
    this.startVisualization();

    return {
      input: this.inputGain,
      output: this.outputGain,
    };
  }

  private startVisualization() {
    if (!this.analyserNode || !this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = this.analyserNode.context.sampleRate;

    // Piano frequency range: A0 (27.5 Hz) to C8 (4186 Hz)
    const minFreq = 20; // Start slightly lower for visual padding
    const maxFreq = 5000; // End slightly higher to capture harmonics

    // Calculate bin indices for our frequency range
    const nyquist = sampleRate / 2;
    const minBin = Math.floor((minFreq / nyquist) * bufferLength);
    const maxBin = Math.ceil((maxFreq / nyquist) * bufferLength);
    const usefulBins = maxBin - minBin;

    const draw = () => {
      this.analyserNode!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

      const width = this.canvas!.width;
      const height = this.canvas!.height;
      
      // Use only the relevant frequency bins
      const barWidth = width / usefulBins;

      for (let i = 0; i < usefulBins; i++) {
        const binIndex = minBin + i;
        const value = dataArray[binIndex];
        const barHeight = (value / 255) * height;
        
        // Color based on frequency (low=red, mid=yellow/green, high=cyan/blue)
        const hue = (i / usefulBins) * 180 + 180; // 180° (cyan) to 360° (red)
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
      }

      this.animationFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  stopVisualization() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}