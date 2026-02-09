import { UIConfigService } from "../services/ui-config-service";

export type OscillatorConfig = {
  id?: number;
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
  // Fallback configs when no UI is present
  private configs: OscillatorConfig[] = [
    { waveform: "sine", detune: 0, level: 1 }
  ];

  // Oscillator UI element id pattern: osc-{index}-{param}
  // e.g., osc-1-waveform, osc-1-detune, osc-1-level
  private readonly idPrefix = "osc-";

  setConfigs(configs: OscillatorConfig[]) {
    // Fallback to a single default oscillator when given empty config list
    this.configs = configs.length > 0 ? configs : [{ waveform: "sine", detune: 0, level: 1 }];
  }

  getConfigs(): OscillatorConfig[] {
    const uiConfigs = this.getConfigsFromUI();
    return uiConfigs.length > 0 ? uiConfigs : this.configs;
  }

  createOscillators(
    audioCtx: AudioContext,
    frequency: number,
    destination: AudioNode,
    lfoToPitch?: GainNode
  ): OscillatorInstance[] {
    const oscillators: OscillatorInstance[] = [];
    const configs = this.getConfigs();

    for (const config of configs) {
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

  // Read oscillator configs from the UI using UIConfigService
  private getConfigsFromUI(): OscillatorConfig[] {
    const indices = this.findOscillatorIndices();
    if (indices.length === 0) return [];

    // Sort indices numerically to keep stable order
    indices.sort((a, b) => a - b);

    const configs: OscillatorConfig[] = [];
    for (const idx of indices) {
      const cfg = UIConfigService.getConfig({
        waveform: {
          id: `${this.idPrefix}${idx}-waveform`,
          select: true,
          transform: (v) => (v as OscillatorType)
        },
        detune: `${this.idPrefix}${idx}-detune`,
        level: `${this.idPrefix}${idx}-level`
      });

      configs.push({
        id: idx,
        waveform: (cfg.waveform as OscillatorType) || "sine",
        detune: Number.isFinite(cfg.detune) ? cfg.detune : 0,
        level: Number.isFinite(cfg.level) ? cfg.level : 1
      });
    }

    return configs;
  }

  // Detect oscillator indices present in the DOM based on id pattern
  private findOscillatorIndices(): number[] {
    const ids = Array.from(document.querySelectorAll<HTMLElement>(`[id^="${this.idPrefix}"]`))
      .map(el => el.id)
      .filter(id => /^osc-\d+-(waveform|detune|level)$/.test(id));

    const indexSet = new Set<number>();
    const regex = /^osc-(\d+)-(waveform|detune|level)$/;
    for (const id of ids) {
      const m = regex.exec(id);
      if (m) {
        indexSet.add(Number.parseInt(m[1], 10));
      }
    }
    return Array.from(indexSet);
  }
}