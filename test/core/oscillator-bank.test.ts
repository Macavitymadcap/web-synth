import { describe, it, expect, beforeEach, jest } from "bun:test";
import { OscillatorBank } from "../../src/core/oscillator-bank";
import { createMockAudioCtx } from "../fixtures/mock-audio-context";

function setupOscillatorUI(configs: Array<{ id: number; waveform: OscillatorType; detune: number; level: number }>) {
  document.body.innerHTML = "";

  for (const c of configs) {
    // Waveform select
    const wf = document.createElement("select");
    wf.id = `osc-${c.id}-waveform`;
    ["sine", "square", "sawtooth", "triangle"].forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      wf.appendChild(opt);
    });
    wf.value = c.waveform;
    document.body.appendChild(wf);

    // Detune input
    const det = document.createElement("input");
    det.id = `osc-${c.id}-detune`;
    det.type = "number";
    det.value = String(c.detune);
    document.body.appendChild(det);

    // Level input
    const lvl = document.createElement("input");
    lvl.id = `osc-${c.id}-level`;
    lvl.type = "number";
    lvl.value = String(c.level);
    document.body.appendChild(lvl);
  }
}

describe("OscillatorBank (UIConfigService)", () => {
  let bank: OscillatorBank;

  beforeEach(() => {
    document.body.innerHTML = "";
    bank = new OscillatorBank();
  });

  it("reads oscillator configs from UI via UIConfigService", () => {
    setupOscillatorUI([
      { id: 1, waveform: "sawtooth", detune: -10, level: 0.5 },
      { id: 2, waveform: "square", detune: 7, level: 0.8 }
    ]);

    const configs = bank.getConfigs();
    expect(configs).toEqual([
      { id: 1, waveform: "sawtooth", detune: -10, level: 0.5 },
      { id: 2, waveform: "square", detune: 7, level: 0.8 }
    ]);
  });

  it("falls back to internal configs when no UI controls exist", () => {
    bank.setConfigs([
      { waveform: "triangle", detune: 5, level: 0.6 }
    ]);

    const configs = bank.getConfigs();
    expect(configs).toEqual([
      { waveform: "triangle", detune: 5, level: 0.6 }
    ]);
  });

  it("setConfigs([]) falls back to a single default sine oscillator", () => {
    bank.setConfigs([]);
    expect(bank.getConfigs()).toEqual([
      { waveform: "sine", detune: 0, level: 1 }
    ]);
  });

  it("createOscillators uses UI configs and connects nodes correctly", () => {
    setupOscillatorUI([
      { id: 1, waveform: "sawtooth", detune: -10, level: 0.4 },
      { id: 2, waveform: "square", detune: 12, level: 0.7 }
    ]);

    const ctx = createMockAudioCtx();
    const destination = { connect: jest.fn(), disconnect: jest.fn() } as any;

    const instances = bank.createOscillators(ctx, 440, destination);

    expect(instances.length).toBe(2);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
    expect(ctx.createGain).toHaveBeenCalledTimes(2);

    // Verify oscillator settings
    expect(instances[0].osc.type).toBe("sawtooth");
    expect(instances[0].osc.frequency.value).toBe(440);
    expect(instances[0].osc.detune.value).toBe(-10);

    expect(instances[1].osc.type).toBe("square");
    expect(instances[1].osc.frequency.value).toBe(440);
    expect(instances[1].osc.detune.value).toBe(12);

    // Verify gain levels and connections to destination
    const gainNodes = (ctx as any).__mockGainNodes;
    expect(gainNodes[0].gain.value).toBeCloseTo(0.4);
    expect(gainNodes[1].gain.value).toBeCloseTo(0.7);
    expect(gainNodes[0].connect).toHaveBeenCalledWith(destination);
    expect(gainNodes[1].connect).toHaveBeenCalledWith(destination);
  });

  it("connects LFO to each oscillator's detune when provided", () => {
    setupOscillatorUI([
      { id: 1, waveform: "sine", detune: 0, level: 1 },
      { id: 2, waveform: "triangle", detune: 3, level: 0.5 }
    ]);

    const ctx = createMockAudioCtx();
    const destination = { connect: jest.fn(), disconnect: jest.fn() } as any;
    const lfoGain = ctx.createGain();

    const instances = bank.createOscillators(ctx, 220, destination, lfoGain);

    // One connect per oscillator to osc.detune
    expect(lfoGain.connect).toHaveBeenCalledTimes(instances.length);
    instances.forEach(inst => {
      expect(lfoGain.connect).toHaveBeenCalledWith(inst.osc.detune);
    });
  });

  it("startOscillators and stopOscillators call underlying node methods", () => {
    setupOscillatorUI([
      { id: 1, waveform: "sine", detune: 0, level: 1 },
      { id: 2, waveform: "sine", detune: 0, level: 1 }
    ]);

    const ctx = createMockAudioCtx();
    const destination = { connect: jest.fn(), disconnect: jest.fn() } as any;
    const instances = bank.createOscillators(ctx, 330, destination);

    bank.startOscillators(instances, 1.23);
    bank.stopOscillators(instances, 2.34);

    instances.forEach(inst => {
      expect(inst.osc.start).toHaveBeenCalledWith(1.23);
      expect(inst.osc.stop).toHaveBeenCalledWith(2.34);
    });
  });
});