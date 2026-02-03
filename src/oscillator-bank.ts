export type OscillatorConfig = {
  waveform: OscillatorType;
  detune: number;
  level: number;
};

export type OscillatorInstance = {
  osc: OscillatorNode;
  waveform: OscillatorType;
  detune: number;
  level: number;
};

export class OscillatorBank {
  private configs: OscillatorConfig[] = [
    { waveform: "sine", detune: 0, level: 1 }
  ];

  setConfigs(configs: OscillatorConfig[]) {
    this.configs = configs.length > 0 ? configs : [{ waveform: "sine", detune: 0, level: 1 }];
  }

  getConfigs(): OscillatorConfig[] {
    return this.configs;
  }

  createOscillators(
    audioCtx: AudioContext,
    frequency: number,
    destination: AudioNode,
    lfoToPitch?: GainNode
  ): OscillatorInstance[] {
    const oscillators: OscillatorInstance[] = [];

    for (const config of this.configs) {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = config.waveform;
      osc.frequency.value = frequency;
      osc.detune.value = config.detune;

      // Connect LFO to pitch (vibrato) if provided
      if (lfoToPitch) {
        lfoToPitch.connect(osc.detune);
      }

      oscGain.gain.value = config.level;

      osc.connect(oscGain);
      oscGain.connect(destination);

      oscillators.push({
        osc,
        waveform: config.waveform,
        detune: config.detune,
        level: config.level
      });
    }

    return oscillators;
  }

  startOscillators(oscillators: OscillatorInstance[], startTime?: number) {
    for (const o of oscillators) {
      o.osc.start(startTime);
    }
  }

  stopOscillators(oscillators: OscillatorInstance[], stopTime?: number) {
    for (const o of oscillators) {
      o.osc.stop(stopTime);
    }
  }
}