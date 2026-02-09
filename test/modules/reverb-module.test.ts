import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { ReverbModule } from '../../src/modules/reverb-module';
import { createMockInput } from '../fixtures/mock-input';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('ReverbModule', () => {
  let decayEl: HTMLInputElement;
  let mixEl: HTMLInputElement;
  let reverb: ReverbModule;

  beforeEach(() => {
    decayEl = createMockInput('2.5');
    mixEl = createMockInput('0.4');
    reverb = new ReverbModule(decayEl, mixEl);
  });

  it('returns correct config', () => {
    expect(reverb.getConfig()).toEqual({ decay: 2.5, mix: 0.4 });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = reverb.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createConvolver).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    reverb.initialize(ctx, dest);
    expect(reverb.isInitialized()).toBe(true);
  });

    it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    reverb.initialize(ctx, dest);
  
    (mixEl as any).value = '0.7';
    (mixEl as any).dispatchEvent(new Event('input'));
  
    expect(reverb['wetGain']!.gain.value).toBeCloseTo(0.7);
    expect(reverb['dryGain']!.gain.value).toBeCloseTo(0.3);
  });
  

  it('updateWithContext regenerates impulse response', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    reverb.initialize(ctx, dest);

    const spy = jest.spyOn(reverb as any, 'generateImpulseResponse');
    reverb.updateWithContext(ctx);
    expect(spy).toHaveBeenCalled();
  });
});