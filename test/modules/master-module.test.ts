import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { MasterModule } from "../../src/modules/master-module";
import { createMockAudioCtx } from "../fixtures/mock-audio-context";

describe("MasterModule (UIConfigService)", () => {
  const originalAudioContext = globalThis.AudioContext as any;
  let AudioContextMock: jest.Mock<any>;

  beforeEach(() => {
    document.body.innerHTML = "";

    // Create master volume input
    const vol = document.createElement("input");
    vol.id = "master-volume";
    vol.type = "number";
    vol.value = "0.7";
    document.body.appendChild(vol);

    // Patch global AudioContext constructor to return our mock context
    const ctx = createMockAudioCtx({
      destination: { connect: jest.fn(), disconnect: jest.fn() } as any,
    }) as any;
    AudioContextMock = jest.fn(() => ctx);
    // @ts-expect-error override for tests
    globalThis.AudioContext = AudioContextMock;
  });

  afterEach(() => {
    // Restore original AudioContext
    globalThis.AudioContext = originalAudioContext;
  });

  it("getConfig reads volume from UI via UIConfigService", () => {
    const module = new MasterModule();
    const cfg = module.getConfig();
    expect(cfg).toEqual({ volume: 0.7 });
  });

  it("initialize creates AudioContext and master gain with configured volume", () => {
    const module = new MasterModule();
    const ctx = module.initialize();

    expect(AudioContextMock).toHaveBeenCalledTimes(1);
    expect(ctx.createGain).toHaveBeenCalledTimes(1);

    const gainNode = module.getMasterGain()!;
    expect(gainNode.gain.value).toBeCloseTo(0.7);

    // Master gain connects to destination
    expect(gainNode.connect).toHaveBeenCalledWith((ctx as any).destination);
    expect(module.getAudioContext()).toBe(ctx);
    expect(module.isInitialized()).toBe(true);
  });

  it("updates master gain on input event", () => {
    const module = new MasterModule();
    module.initialize();

    const volEl = document.getElementById("master-volume") as HTMLInputElement;
    volEl.value = "0.3";
    volEl.dispatchEvent(new Event("input"));

    expect(module.getMasterGain()!.gain.value).toBeCloseTo(0.3);
  });

  it("setVolume updates the gain programmatically", () => {
    const module = new MasterModule();
    module.initialize();

    module.setVolume(0.45);
    expect(module.getMasterGain()!.gain.value).toBeCloseTo(0.45);
  });

  it("initialize is idempotent (does not recreate context)", () => {
    const module = new MasterModule();
    const ctx1 = module.initialize();
    const ctx2 = module.initialize();

    expect(ctx1).toBe(ctx2);
    expect(AudioContextMock).toHaveBeenCalledTimes(1);
  });

  it("returns nulls before initialization", () => {
    const module = new MasterModule();
    expect(module.getAudioContext()).toBeNull();
    expect(module.getMasterGain()).toBeNull();
    expect(module.isInitialized()).toBe(false);
  });
});