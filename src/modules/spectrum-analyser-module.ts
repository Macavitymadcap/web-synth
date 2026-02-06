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
    this.outputGain.connect(destination);

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

    const draw = () => {
      this.analyserNode!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

      const width = this.canvas!.width;
      const height = this.canvas!.height;
      const barWidth = width / bufferLength;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * height;
        ctx.fillStyle = `hsl(${i / bufferLength * 270 + 180}, 100%, 60%)`;
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