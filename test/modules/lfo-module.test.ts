import { describe, it, expect, beforeEach } from 'bun:test';
import { LFOModule } from '../../src/modules/lfo-module';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('LFOModule (UIConfigService)', () => {
  describe('LFO 1 (default prefix)', () => {
    let module: LFOModule;

    beforeEach(() => {
      document.body.innerHTML = '';

      const rate = document.createElement('input');
      rate.id = 'lfo-1-rate';
      rate.type = 'number';
      rate.value = '2.0';
      document.body.appendChild(rate);

      const toFilter = document.createElement('input');
      toFilter.id = 'lfo-1-to-filter';
      toFilter.type = 'number';
      toFilter.value = '0.5';
      document.body.appendChild(toFilter);

      const toPitch = document.createElement('input');
      toPitch.id = 'lfo-1-to-pitch';
      toPitch.type = 'number';
      toPitch.value = '0.25';
      document.body.appendChild(toPitch);

      const waveform = document.createElement('select');
      waveform.id = 'lfo-1-waveform';
      const optSine = document.createElement('option');
      optSine.value = 'sine';
      const optTriangle = document.createElement('option');
      optTriangle.value = 'triangle';
      waveform.appendChild(optSine);
      waveform.appendChild(optTriangle);
      waveform.value = 'sine';
      document.body.appendChild(waveform);

      module = new LFOModule('1'); // ID = '1'
    });

    it('returns correct config', () => {
      expect(module.getConfig()).toEqual({
        rate: 2,
        waveform: 'sine',
        toFilter: 0.5,
        toPitch: 0.25
      });
    });

    it('initializes nodes and sets values', () => {
      const ctx = createMockAudioCtx();
      const routing = module.initialize(ctx);

      expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
      expect(ctx.createGain).toHaveBeenCalledTimes(3);
      expect(routing.toFilter).toBeTruthy();
      expect(routing.toPitch).toBeTruthy();
    });

    it('updates rate on input change', () => {
      const ctx = createMockAudioCtx();
      module.initialize(ctx);

      const rateInput = document.getElementById('lfo-1-rate') as HTMLInputElement;
      rateInput.value = '5.0';
      rateInput.dispatchEvent(new Event('input'));

      const lfoNode = (module as any)['lfo'];
      expect(lfoNode.frequency.value).toBe(5);
    });
  });

  describe('LFO 2 (custom prefix)', () => {
    let module: LFOModule;

    beforeEach(() => {
      document.body.innerHTML = '';

      const rate = document.createElement('input');
      rate.id = 'lfo-lfo2-rate';
      rate.type = 'number';
      rate.value = '3.0';
      document.body.appendChild(rate);

      const toFilter = document.createElement('input');
      toFilter.id = 'lfo-lfo2-to-filter';
      toFilter.type = 'number';
      toFilter.value = '0.7';
      document.body.appendChild(toFilter);

      const toPitch = document.createElement('input');
      toPitch.id = 'lfo-lfo2-to-pitch';
      toPitch.type = 'number';
      toPitch.value = '0.4';
      document.body.appendChild(toPitch);

      const waveform = document.createElement('select');
      waveform.id = 'lfo-lfo2-waveform';
      const optTriangle = document.createElement('option');
      optTriangle.value = 'triangle';
      waveform.appendChild(optTriangle);
      waveform.value = 'triangle';
      document.body.appendChild(waveform);

      module = new LFOModule('lfo2'); // Custom prefix
    });

    it('returns correct config with lfo2 prefix', () => {
      expect(module.getConfig()).toEqual({
        rate: 3,
        waveform: 'triangle',
        toFilter: 0.7,
        toPitch: 0.4
      });
    });

    it('updates parameters with lfo2 prefix', () => {
      const ctx = createMockAudioCtx();
      module.initialize(ctx);

      const rateInput = document.getElementById('lfo-lfo2-rate') as HTMLInputElement;
      rateInput.value = '6.0';
      rateInput.dispatchEvent(new Event('input'));

      const lfoNode = (module as any)['lfo'];
      expect(lfoNode.frequency.value).toBe(6);
    });
  });

  describe('Multiple LFO instances', () => {
    it('can create multiple independent LFOs', () => {
      document.body.innerHTML = '';

      // LFO 1 controls
      ['lfo-1-rate', 'lfo-1-to-filter', 'lfo-1-to-pitch'].forEach(id => {
        const input = document.createElement('input');
        input.id = id;
        input.type = 'number';
        input.value = '2';
        document.body.appendChild(input);
      });
      const lfo1Wave = document.createElement('select');
      lfo1Wave.id = 'lfo-1-waveform';
      const sineOption = document.createElement('option');
      sineOption.value = 'sine';
      sineOption.textContent = 'Sine';
      lfo1Wave.appendChild(sineOption);
      lfo1Wave.value = 'sine';
      document.body.appendChild(lfo1Wave);

      // LFO 2 controls
      ['lfo-lfo2-rate', 'lfo-lfo2-to-filter', 'lfo-lfo2-to-pitch'].forEach(id => {
        const input = document.createElement('input');
        input.id = id;
        input.type = 'number';
        input.value = '3';
        document.body.appendChild(input);
      });
      const lfo2Wave = document.createElement('select');
      lfo2Wave.id = 'lfo-lfo2-waveform';
      const triangleOption = document.createElement('option');
      triangleOption.value = 'triangle';
      triangleOption.textContent = 'Triangle';
      lfo2Wave.appendChild(triangleOption);
      lfo2Wave.value = 'triangle';
      document.body.appendChild(lfo2Wave);

      const lfo1 = new LFOModule('1');
      const lfo2 = new LFOModule('lfo2');

      expect(lfo1.getConfig().rate).toBe(2);
      expect(lfo2.getConfig().rate).toBe(3);
      expect(lfo1.getConfig().waveform).toBe('sine');
      expect(lfo2.getConfig().waveform).toBe('triangle');
    });
  });
});