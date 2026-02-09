import { describe, it, expect, beforeEach, jest } from "bun:test";
import { FilterModule } from "../../src/modules/filter-module";
import { createMockAudioCtx } from "../fixtures/mock-audio-context";

class MockEnvelopeModule {
  applyEnvelope = jest.fn();
  applyRelease = jest.fn((_param: any, _start: number, _base: number) => 0.42);
  getRelease = jest.fn(() => 0.42);
}

describe("FilterModule (UIConfigService)", () => {
  let module: FilterModule;
  let envelope: MockEnvelopeModule;

  beforeEach(() => {
    document.body.innerHTML = "";

    // Select for filter type
    const typeEl = document.createElement("select");
    typeEl.id = "filter-type";
    // Ensure options exist so .value reflects a valid selection
    ["lowpass", "bandpass", "highpass"].forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      typeEl.appendChild(opt);
    });
    typeEl.value = "lowpass";
    document.body.appendChild(typeEl);

    // Inputs for cutoff, resonance, envelope amount
    const cutoffEl = document.createElement("input");
    cutoffEl.id = "filter-cutoff";
    cutoffEl.type = "number";
    cutoffEl.value = "1200";
    document.body.appendChild(cutoffEl);

    const resonanceEl = document.createElement("input");
    resonanceEl.id = "filter-resonance";
    resonanceEl.type = "number";
    resonanceEl.value = "1.5";
    document.body.appendChild(resonanceEl);

    const envAmtEl = document.createElement("input");
    envAmtEl.id = "filter-env-amount";
    envAmtEl.type = "number";
    envAmtEl.value = "500";
    document.body.appendChild(envAmtEl);

    envelope = new MockEnvelopeModule();
    module = new FilterModule(envelope as any);
  });

  it("getConfig returns values from DOM via UIConfigService", () => {
    const cfg = module.getConfig();
    expect(cfg).toEqual({
      type: "lowpass",
      cutoff: 1200,
      resonance: 1.5,
      envelopeAmount: 500,
    });
  });

  it("createFilter initializes BiquadFilter and envelope gain with config", () => {
    const ctx = createMockAudioCtx();
    const instance = module.createFilter(ctx);

    expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(1);
    expect(ctx.createGain).toHaveBeenCalledTimes(1);

    expect(instance.filter.type).toBe("lowpass");
    expect(instance.filter.frequency.value).toBe(1200);
    expect(instance.filter.Q.value).toBe(1.5);

    expect(instance.envelopeGain.gain.value).toBe(500);
    expect(instance.envelopeGain.connect).toHaveBeenCalledWith(instance.filter.frequency);
  });

  it("createFilter connects lfoToFilter to filter.frequency when provided", () => {
    const ctx = createMockAudioCtx();
    const lfoGain = ctx.createGain();
    const instance = module.createFilter(ctx, lfoGain);

    expect(lfoGain.connect).toHaveBeenCalledWith(instance.filter.frequency);
  });

  it("applyEnvelope calls envelope.applyEnvelope with correct params", () => {
    const ctx = createMockAudioCtx();
    const instance = module.createFilter(ctx);

    const startTime = 1.234;
    module.applyEnvelope(instance, startTime);

    expect(envelope.applyEnvelope).toHaveBeenCalledTimes(1);
    const call = (envelope.applyEnvelope as any).mock.calls[0];
    expect(call[0]).toBe(instance.envelopeGain.gain); // AudioParam target
    expect(call[1]).toBe(startTime);
    expect(call[2]).toBe(0); // base
    expect(call[3]).toBe(500); // envelopeAmount
  });

  it("applyRelease delegates to envelope.applyRelease and returns its value", () => {
    const ctx = createMockAudioCtx();
    const instance = module.createFilter(ctx);

    const startTime = 2.5;
    const val = module.applyRelease(instance, startTime);

    expect(envelope.applyRelease).toHaveBeenCalledWith(instance.envelopeGain.gain, startTime, 0);
    expect(val).toBeCloseTo(0.42);
  });

  it("getRelease returns envelope.getRelease", () => {
    expect(module.getRelease()).toBeCloseTo(0.42);
  });

  it("uses selected filter type from DOM", () => {
    const typeEl = document.getElementById("filter-type") as HTMLSelectElement;
    typeEl.value = "bandpass";

    const ctx = createMockAudioCtx();
    const instance = module.createFilter(ctx);
    expect(instance.filter.type).toBe("bandpass");
  });
});