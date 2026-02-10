import { describe, it, expect, beforeEach, jest } from "bun:test";
import { VoiceManager } from "../../src/core/voice-manager";
import { createMockAudioCtx } from "../fixtures/mock-audio-context";

// Minimal mocks for dependencies
class MockOscillatorBank {
  public createOscillators = jest.fn((_ctx: AudioContext, _freq: number, _dest: AudioNode, _lfo?: GainNode) => {
    const osc1 = {
      osc: { start: jest.fn(), stop: jest.fn(), detune: { value: 0 }, frequency: { value: 0 }, connect: jest.fn(), disconnect: jest.fn() } as any,
      waveform: "sine" as OscillatorType,
      detune: 0,
      level: 1
    };
    const osc2 = {
      osc: { start: jest.fn(), stop: jest.fn(), detune: { value: 0 }, frequency: { value: 0 }, connect: jest.fn(), disconnect: jest.fn() } as any,
      waveform: "sine" as OscillatorType,
      detune: 0,
      level: 1
    };
    return [osc1, osc2];
  });

  public startOscillators = jest.fn((instances: any[]) => {
    instances.forEach(i => i.osc.start());
  });

  public stopOscillators = jest.fn((_instances: any[], _stopTime?: number) => {});
}

class MockEnvelopeModule {
  public applyEnvelope = jest.fn((_param: AudioParam, _start: number, _base: number, _target: number) => {});
  public applyRelease = jest.fn((_param: AudioParam, _start: number) => 0.4);
}

class MockFilterModule {
  public createFilter = jest.fn((ctx: AudioContext, _lfo?: GainNode) => {
    const filter = ctx.createBiquadFilter();
    const envelopeGain = ctx.createGain();
    return { filter, envelopeGain };
  });

  public applyEnvelope = jest.fn((_instance: any, _start: number) => {});
  public applyRelease = jest.fn((_instance: any, _start: number) => 0.6);
}

class MockLFOModule {
  private filterLfo: GainNode | null = null;
  private pitchLfo: GainNode | null = null;

  setFilterLfo(node: GainNode) { this.filterLfo = node; }
  setPitchLfo(node: GainNode) { this.pitchLfo = node; }

  getFilterModulation(): GainNode | null { return this.filterLfo; }
  getPitchModulation(): GainNode | null { return this.pitchLfo; }
}

class MockNoiseModule {
  public createNoiseSource = jest.fn((_ctx: AudioContext) => {
    // Return null by default (noise disabled)
    return null;
  });

  public getConfig = jest.fn(() => ({
    type: 'white' as const,
    level: 0.3,
    enabled: false
  }));
}

describe("VoiceManager (UIConfigService + Multiple LFOs)", () => {
  let ctx: AudioContext & any;
  let destination: AudioNode & any;
  let oscBank: MockOscillatorBank;
  let ampEnv: MockEnvelopeModule;
  let filterModule: MockFilterModule;
  let lfo1Module: MockLFOModule;
  let lfo2Module: MockLFOModule;
  let noiseModule: MockNoiseModule;
  let vm: VoiceManager;

  beforeEach(() => {
    document.body.innerHTML = "";
    // Polyphonic toggle
    const polyEl = document.createElement("input");
    polyEl.id = "poly";
    polyEl.type = "checkbox";
    polyEl.checked = true;
    document.body.appendChild(polyEl);

    ctx = createMockAudioCtx({ currentTime: 1 }) as any;
    destination = { connect: jest.fn(), disconnect: jest.fn() } as any;

    oscBank = new MockOscillatorBank();
    ampEnv = new MockEnvelopeModule();
    filterModule = new MockFilterModule();
    lfo1Module = new MockLFOModule();
    lfo2Module = new MockLFOModule();
    noiseModule = new MockNoiseModule();

    // Provide LFO nodes for both LFOs
    lfo1Module.setFilterLfo(ctx.createGain());
    lfo1Module.setPitchLfo(ctx.createGain());
    lfo2Module.setFilterLfo(ctx.createGain());
    lfo2Module.setPitchLfo(ctx.createGain());

    vm = new VoiceManager(
      oscBank as any,
      ampEnv as any,
      filterModule as any,
      [lfo1Module as any, lfo2Module as any],
      noiseModule as any
    );
  });

  it("getConfig reads polyphonic from UI via UIConfigService", () => {
    // default true
    expect(vm.getConfig()).toEqual({ polyphonic: true });

    // set false
    const polyEl = document.getElementById("poly") as HTMLInputElement;
    polyEl.checked = false;
    expect(vm.getConfig()).toEqual({ polyphonic: false });
  });

  it("createVoice builds graph, applies envelopes, and starts oscillators", () => {
    vm.createVoice(ctx, "A4", 440, 0.8, destination);

    const voice = vm.getVoice("A4")!;
    expect(voice).toBeDefined();

    // Filter -> Gain -> Destination
    const filterNode = voice.filterInstance.filter;
    expect(filterNode.connect).toHaveBeenCalledWith(voice.gain);
    expect(voice.gain.connect).toHaveBeenCalledWith(destination);

    // Envelope calls
    expect(ampEnv.applyEnvelope).toHaveBeenCalled();
    expect(filterModule.applyEnvelope).toHaveBeenCalled();

    // Oscillator started
    expect(oscBank.startOscillators).toHaveBeenCalled();

    // Noise module was called
    expect(noiseModule.createNoiseSource).toHaveBeenCalled();
  });

  it("combines multiple LFO modulations for filter and pitch", () => {
    vm.createVoice(ctx, "C4", 261.63, 1, destination);

    // Check that createGain was called for mixer nodes (2 mixers: filter + pitch)
    // Each LFO has 2 gain nodes, plus 2 mixer gains = 6 total
    expect(ctx.createGain).toHaveBeenCalled();

    // FilterModule should receive combined filter modulation
    const filterCall = (filterModule.createFilter as any).mock.calls[0];
    expect(filterCall[0]).toBe(ctx);
    const passedLfoToFilter = filterCall[1];
    expect(passedLfoToFilter).toBeInstanceOf(Object);

    // OscillatorBank should receive combined pitch modulation
    const oscCall = (oscBank.createOscillators as any).mock.calls[0];
    expect(oscCall[0]).toBe(ctx);
    expect(oscCall[1]).toBeCloseTo(261.63);
    const passedLfoToPitch = oscCall[3];
    expect(passedLfoToPitch).toBeInstanceOf(Object);
  });

  it("handles single LFO without creating mixer", () => {
    // Create VM with only one LFO
    const vmSingleLfo = new VoiceManager(
      oscBank as any,
      ampEnv as any,
      filterModule as any,
      [lfo1Module as any],
      noiseModule as any
    );

    vmSingleLfo.createVoice(ctx, "D4", 293.66, 1, destination);

    // Should pass LFO directly without creating mixer
    const filterCall = (filterModule.createFilter as any).mock.calls[0];
    const passedLfoToFilter = filterCall[1];
    expect(passedLfoToFilter).toBe(lfo1Module.getFilterModulation());
  });

  it("handles no LFOs gracefully", () => {
    const vmNoLfos = new VoiceManager(
      oscBank as any,
      ampEnv as any,
      filterModule as any,
      [],
      noiseModule as any
    );

    vmNoLfos.createVoice(ctx, "E4", 329.63, 1, destination);

    // Should pass undefined to filter and oscillators
    const filterCall = (filterModule.createFilter as any).mock.calls[0];
    expect(filterCall[1]).toBeUndefined();

    const oscCall = (oscBank.createOscillators as any).mock.calls[0];
    expect(oscCall[3]).toBeUndefined();
  });

  it("integrates noise source when enabled", () => {
    // Mock enabled noise source
    const mockNoiseSource = {
      start: jest.fn(),
      stop: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    } as any;
    
    const mockNoiseGain = ctx.createGain();
    
    noiseModule.createNoiseSource.mockReturnValue({ source: mockNoiseSource, gain: mockNoiseGain } as any);

    vm.createVoice(ctx, "A4", 440, 0.8, destination);

    const voice = vm.getVoice("A4")!;
    
    // Noise source was started
    expect(mockNoiseSource.start).toHaveBeenCalled();
    
    // Noise was connected to filter
    expect(mockNoiseGain.connect).toHaveBeenCalledWith(voice.filterInstance.filter);
    
    // Noise source stored in voice
    expect(voice.noiseSource).toBe(mockNoiseSource);
    expect(voice.noiseGain).toBe(mockNoiseGain);
  });

  it("monophonic mode stops existing voices when new voice starts", () => {
    const polyEl = document.getElementById("poly") as HTMLInputElement;
    polyEl.checked = false; // mono

    vm.createVoice(ctx, "A4", 440, 0.7, destination);
    vm.createVoice(ctx, "B4", 493.88, 0.7, destination);

    // Previous voice oscillators stopped once
    expect(oscBank.stopOscillators).toHaveBeenCalledTimes(1);
    expect(vm.getVoiceCount()).toBe(1);
    expect(vm.hasVoice("B4")).toBe(true);
    expect(vm.hasVoice("A4")).toBe(false);
  });

  it("polyphonic mode allows multiple simultaneous voices", () => {
    const polyEl = document.getElementById("poly") as HTMLInputElement;
    polyEl.checked = true; // poly

    vm.createVoice(ctx, "A4", 440, 0.7, destination);
    vm.createVoice(ctx, "C5", 523.25, 0.7, destination);

    expect(oscBank.stopOscillators).not.toHaveBeenCalled();
    expect(vm.getVoiceCount()).toBe(2);
    expect(vm.hasVoice("A4")).toBe(true);
    expect(vm.hasVoice("C5")).toBe(true);
  });

  it("stopVoice applies releases and schedules oscillator stop at max release", () => {
    vm.createVoice(ctx, "A4", 440, 0.7, destination);
    const t = 2;
    vm.stopVoice("A4", t);

    // ampRelease=0.4, filterRelease=0.6 -> max=0.6
    expect(filterModule.applyRelease).toHaveBeenCalled();
    expect(ampEnv.applyRelease).toHaveBeenCalled();

    const stopArgs = (oscBank.stopOscillators as any).mock.calls[0];
    const stopTime = stopArgs[1];
    expect(stopTime).toBeCloseTo(t + 0.6);
    expect(vm.hasVoice("A4")).toBe(false);
  });

  it("stopVoice stops noise source if present", () => {
    // Mock enabled noise source
    const mockNoiseSource = {
      start: jest.fn(),
      stop: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    } as any;
    
    const mockNoiseGain = ctx.createGain();
    
    noiseModule.createNoiseSource.mockReturnValue({ source: mockNoiseSource, gain: mockNoiseGain } as any);

    vm.createVoice(ctx, "A4", 440, 0.7, destination);
    const t = 2;
    vm.stopVoice("A4", t);

    // Noise source should be stopped at the same time as oscillators
    expect(mockNoiseSource.stop).toHaveBeenCalledWith(t + 0.6);
  });

  it("stopAllVoices stops and clears all active voices", () => {
    vm.createVoice(ctx, "A4", 440, 0.7, destination);
    vm.createVoice(ctx, "C5", 523.25, 0.7, destination);

    vm.stopAllVoices(5);

    expect(oscBank.stopOscillators).toHaveBeenCalledTimes(2);
    expect(vm.getVoiceCount()).toBe(0);
  });

  it("clearAllVoices immediately stops without release and clears map", () => {
    vm.createVoice(ctx, "A4", 440, 0.7, destination);
    vm.createVoice(ctx, "C5", 523.25, 0.7, destination);

    vm.clearAllVoices();

    // stopOscillators called for each voice without stopTime
    const calls = (oscBank.stopOscillators as any).mock.calls;
    calls.forEach((args: any[]) => {
      expect(args[1]).toBeUndefined();
    });
    expect(vm.getVoiceCount()).toBe(0);
  });
});