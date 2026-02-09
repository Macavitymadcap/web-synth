import { describe, it, expect, beforeEach } from 'bun:test';
import { LFOModule } from '../../src/modules/lfo-module';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('LFOModule (UIConfigService)', () => {
  let module: LFOModule;

  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';

    // Create required controls
    const rate = document.createElement('input');
    rate.id = 'lfo-rate';
    rate.type = 'number';
    rate.value = '2.0';
    document.body.appendChild(rate);

    const toFilter = document.createElement('input');
    toFilter.id = 'lfo-to-filter';
    toFilter.type = 'number';
    toFilter.value = '0.5';
    document.body.appendChild(toFilter);

    const toPitch = document.createElement('input');
    toPitch.id = 'lfo-to-pitch';
    toPitch.type = 'number';
    toPitch.value = '0.25';
    document.body.appendChild(toPitch);

    const waveform = document.createElement('select');
    waveform.id = 'lfo-waveform';
    const optSine = document.createElement('option');
    optSine.value = 'sine';
    optSine.textContent = 'Sine';
    const optTriangle = document.createElement('option');
    optTriangle.value = 'triangle';
    optTriangle.textContent = 'Triangle';
    waveform.appendChild(optSine);
    waveform.appendChild(optTriangle);
    waveform.value = 'sine';
    document.body.appendChild(waveform);

    module = new LFOModule();
  });

  it('returns correct config', () => {
    // Update values
    (document.getElementById('lfo-rate') as HTMLInputElement).value = '3.5';
    (document.getElementById('lfo-to-filter') as HTMLInputElement).value = '0.7';
    (document.getElementById('lfo-to-pitch') as HTMLInputElement).value = '0.4';
    (document.getElementById('lfo-waveform') as HTMLSelectElement).value = 'triangle';

    expect(module.getConfig()).toEqual({
      rate: 3.5,
      waveform: 'triangle',
      toFilter: 0.7,
      toPitch: 0.4
    });
  });

  it('initializes nodes and sets values', () => {
    const ctx = createMockAudioCtx();
    const routing = module.initialize(ctx);

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
    expect(ctx.createGain).toHaveBeenCalledTimes(3);

    expect(routing.toFilter).toBeTruthy();
    expect(routing.toPitch).toBeTruthy();

    // Ensure initial values were set
    const gains = (ctx as any).__mockGainNodes;
    // Order: lfoGain, lfoToFilter, lfoToPitch
    const lfoGain = gains[0];
    const lfoToFilter = gains[1];
    const lfoToPitch = gains[2];
    expect(lfoGain.gain.value).toBe(1);
    expect(typeof lfoToFilter.gain.value).toBe('number');
    expect(typeof lfoToPitch.gain.value).toBe('number');

    // Oscillator started
    const lfoNode = (module as any)['lfo'];
    expect(lfoNode.start).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    module.initialize(ctx);
    expect(module.isInitialized()).toBe(true);
  });

  it('getFilterModulation and getPitchModulation return nodes after initialize', () => {
    const ctx = createMockAudioCtx();
    module.initialize(ctx);
    expect(module.getFilterModulation()).not.toBeNull();
    expect(module.getPitchModulation()).not.toBeNull();
  });

  it('updates rate on input change', () => {
    const ctx = createMockAudioCtx();
    module.initialize(ctx);

    const rateInput = document.getElementById('lfo-rate') as HTMLInputElement;
    rateInput.value = '5.0';
    rateInput.dispatchEvent(new Event('input'));

    const lfoNode = (module as any)['lfo'];
    expect(lfoNode.frequency.value).toBe(5);
  });

  it('updates toFilter gain on input change', () => {
    const ctx = createMockAudioCtx();
    module.initialize(ctx);

    const filterInput = document.getElementById('lfo-to-filter') as HTMLInputElement;
    filterInput.value = '0.9';
    filterInput.dispatchEvent(new Event('input'));

    const lfoToFilter = (module as any)['lfoToFilter'];
    expect(lfoToFilter.gain.value).toBe(0.9);
  });

  it('updates toPitch gain on input change', () => {
    const ctx = createMockAudioCtx();
    module.initialize(ctx);

    const pitchInput = document.getElementById('lfo-to-pitch') as HTMLInputElement;
    pitchInput.value = '0.6';
    pitchInput.dispatchEvent(new Event('input'));

    const lfoToPitch = (module as any)['lfoToPitch'];
    expect(lfoToPitch.gain.value).toBe(0.6);
  });

  it('updates waveform on select change', () => {
    const ctx = createMockAudioCtx();
    module.initialize(ctx);

    const waveformSelect = document.getElementById('lfo-waveform') as HTMLSelectElement;
    waveformSelect.value = 'triangle';
    waveformSelect.dispatchEvent(new Event('change'));

    const lfoNode = (module as any)['lfo'];
    expect(lfoNode.type).toBe('triangle');
  });

  it('returns null modulation nodes before initialization', () => {
    expect(module.getFilterModulation()).toBeNull();
    expect(module.getPitchModulation()).toBeNull();
    expect(module.isInitialized()).toBe(false);
  });
});