import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { ParametricEQModule } from '../../../src/modules/effects/parametric-eq-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

  function createBandControls(band: string, freq: number, gain: number, q: number) {
    const freqInput = document.createElement('input');
    freqInput.id = `eq-${band}-freq`;
    freqInput.type = 'number';
    freqInput.value = freq.toString();
    document.body.appendChild(freqInput);

    const gainInput = document.createElement('input');
    gainInput.id = `eq-${band}-gain`;
    gainInput.type = 'number';
    gainInput.value = gain.toString();
    document.body.appendChild(gainInput);

    const qInput = document.createElement('input');
    qInput.id = `eq-${band}-q`;
    qInput.type = 'number';
    qInput.value = q.toString();
    document.body.appendChild(qInput);
  }

describe('ParametricEQModule (UIConfigService)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    // Create enable toggle
    const enabledToggle = document.createElement('input');
    enabledToggle.id = 'eq-enabled';
    enabledToggle.type = 'checkbox';
    enabledToggle.checked = true;
    document.body.appendChild(enabledToggle);

    // Low Shelf (80 Hz)
    createBandControls('low-shelf', 80, 0, 1);

    // Low Mid (250 Hz)
    createBandControls('low-mid', 250, 0, 1);

    // Mid (1000 Hz)
    createBandControls('mid', 1000, 0, 1);

    // High Mid (4000 Hz)
    createBandControls('high-mid', 4000, 0, 1);

    // High Shelf (12000 Hz)
    createBandControls('high-shelf', 12000, 0, 1);
  });

  describe('getConfig', () => {
    it('reads config from UI via UIConfigService', () => {
      const module = new ParametricEQModule();
      const config = module.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.lowShelf).toEqual({
        frequency: 80,
        gain: 0,
        q: 1,
        type: 'lowshelf'
      });
      expect(config.lowMid).toEqual({
        frequency: 250,
        gain: 0,
        q: 1,
        type: 'peaking'
      });
      expect(config.mid).toEqual({
        frequency: 1000,
        gain: 0,
        q: 1,
        type: 'peaking'
      });
      expect(config.highMid).toEqual({
        frequency: 4000,
        gain: 0,
        q: 1,
        type: 'peaking'
      });
      expect(config.highShelf).toEqual({
        frequency: 12000,
        gain: 0,
        q: 1,
        type: 'highshelf'
      });
    });

    it('returns a copy (not original object)', () => {
      const module = new ParametricEQModule();
      const c1 = module.getConfig();
      const c2 = module.getConfig();
      
      expect(c1).not.toBe(c2);
      expect(c1).toEqual(c2);
    });

    it('handles missing UI controls gracefully', () => {
      document.body.innerHTML = '';
      const module = new ParametricEQModule();
      
      expect(() => module.getConfig()).not.toThrow();
      const config = module.getConfig();
      
      // Should return defaults
      expect(config.lowShelf.frequency).toBe(80);
      expect(config.mid.frequency).toBe(1000);
    });
  });

  describe('initialize', () => {
    it('creates and connects all required nodes', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      const nodes = module.initialize(ctx, dest);

      expect(ctx.createGain).toHaveBeenCalledTimes(2); // input + output
      expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(5); // 5 bands
      expect(nodes.input).toBeDefined();
      expect(nodes.output).toBeDefined();
    });

    it('creates filters with correct types', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      const filters = (ctx.createBiquadFilter as any).mock.results.map((r: any) => r.value);
      
      expect(filters[0].type).toBe('lowshelf');  // Low Shelf
      expect(filters[1].type).toBe('peaking');   // Low Mid
      expect(filters[2].type).toBe('peaking');   // Mid
      expect(filters[3].type).toBe('peaking');   // High Mid
      expect(filters[4].type).toBe('highshelf'); // High Shelf
    });

    it('applies initial config to filters', () => {
      // Set custom values
      (document.getElementById('eq-low-shelf-freq') as HTMLInputElement).value = '100';
      (document.getElementById('eq-low-shelf-gain') as HTMLInputElement).value = '5';
      (document.getElementById('eq-mid-freq') as HTMLInputElement).value = '1500';
      (document.getElementById('eq-mid-gain') as HTMLInputElement).value = '-3';

      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      const filters = (ctx.createBiquadFilter as any).mock.results.map((r: any) => r.value);
      
      expect(filters[0].frequency.value).toBe(100);  // Low Shelf freq
      expect(filters[0].gain.value).toBe(5);         // Low Shelf gain
      expect(filters[2].frequency.value).toBe(1500); // Mid freq
      expect(filters[2].gain.value).toBe(-3);        // Mid gain
    });

    it('chains filters in correct order', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      const inputGain = (ctx.createGain as any).mock.results[0].value;
      const outputGain = (ctx.createGain as any).mock.results[1].value;
      const filters = (ctx.createBiquadFilter as any).mock.results.map((r: any) => r.value);

      // Verify chain: input -> lowShelf -> lowMid -> mid -> highMid -> highShelf -> output -> dest
      expect(inputGain.connect).toHaveBeenCalledWith(filters[0]);
      expect(filters[0].connect).toHaveBeenCalledWith(filters[1]);
      expect(filters[1].connect).toHaveBeenCalledWith(filters[2]);
      expect(filters[2].connect).toHaveBeenCalledWith(filters[3]);
      expect(filters[3].connect).toHaveBeenCalledWith(filters[4]);
      expect(filters[4].connect).toHaveBeenCalledWith(outputGain);
      expect(outputGain.connect).toHaveBeenCalledWith(dest);
    });

    it('disconnects old nodes on re-initialization', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);
      
      const firstInputGain = (ctx.createGain as any).mock.results[0].value;
      const firstFilters = (ctx.createBiquadFilter as any).mock.results.slice(0, 5).map((r: any) => r.value) as BiquadFilterNode[];

      module.initialize(ctx, dest);

      expect(firstInputGain.disconnect).toHaveBeenCalled();
      firstFilters.forEach(filter => {
        expect(filter.disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('runtime parameter updates via UI', () => {
    it('updates low shelf frequency when input changes', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      // Must initialize first - setupParameterListeners called during initialize
      module.initialize(ctx, dest);

      const freqInput = document.getElementById('eq-low-shelf-freq') as HTMLInputElement;
      freqInput.value = '120';
      freqInput.dispatchEvent(new Event('input'));

      const lowShelfFilter = (ctx.createBiquadFilter as any).mock.results[0].value;
      expect(lowShelfFilter.frequency.value).toBe(120);
    });

    it('updates low shelf gain when input changes', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const gainInput = document.getElementById('eq-low-shelf-gain') as HTMLInputElement;
      gainInput.value = '6';
      gainInput.dispatchEvent(new Event('input'));

      const lowShelfFilter = (ctx.createBiquadFilter as any).mock.results[0].value;
      expect(lowShelfFilter.gain.value).toBe(6);
    });

    it('updates low shelf Q when input changes', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const qInput = document.getElementById('eq-low-shelf-q') as HTMLInputElement;
      qInput.value = '0.7';
      qInput.dispatchEvent(new Event('input'));

      const lowShelfFilter = (ctx.createBiquadFilter as any).mock.results[0].value;
      expect(lowShelfFilter.Q.value).toBe(0.7);
    });

    it('updates mid band parameters', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const freqInput = document.getElementById('eq-mid-freq') as HTMLInputElement;
      const gainInput = document.getElementById('eq-mid-gain') as HTMLInputElement;
      const qInput = document.getElementById('eq-mid-q') as HTMLInputElement;

      freqInput.value = '1200';
      freqInput.dispatchEvent(new Event('input'));
      
      gainInput.value = '3';
      gainInput.dispatchEvent(new Event('input'));
      
      qInput.value = '2';
      qInput.dispatchEvent(new Event('input'));

      const midFilter = (ctx.createBiquadFilter as any).mock.results[2].value;
      expect(midFilter.frequency.value).toBe(1200);
      expect(midFilter.gain.value).toBe(3);
      expect(midFilter.Q.value).toBe(2);
    });

    it('updates high shelf parameters', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const freqInput = document.getElementById('eq-high-shelf-freq') as HTMLInputElement;
      const gainInput = document.getElementById('eq-high-shelf-gain') as HTMLInputElement;

      freqInput.value = '10000';
      freqInput.dispatchEvent(new Event('input'));
      
      gainInput.value = '-4';
      gainInput.dispatchEvent(new Event('input'));

      const highShelfFilter = (ctx.createBiquadFilter as any).mock.results[4].value;
      expect(highShelfFilter.frequency.value).toBe(10000);
      expect(highShelfFilter.gain.value).toBe(-4);
    });

    it('updates all bands independently', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const bands = ['low-shelf', 'low-mid', 'mid', 'high-mid', 'high-shelf'];
      const filters = (ctx.createBiquadFilter as any).mock.results.map((r: any) => r.value);

      bands.forEach((band, i) => {
        const gainInput = document.getElementById(`eq-${band}-gain`) as HTMLInputElement;
        gainInput.value = (i + 1).toString();
        gainInput.dispatchEvent(new Event('input'));
        
        expect(filters[i].gain.value).toBe(i + 1);
      });
    });
  });

  describe('enabled/disabled state', () => {
    it('bypasses EQ when disabled by reconnecting nodes', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const inputGain = (ctx.createGain as any).mock.results[0].value;
      const outputGain = (ctx.createGain as any).mock.results[1].value;

      // Clear previous calls
      inputGain.connect.mockClear();
      inputGain.disconnect.mockClear();
      outputGain.connect.mockClear();
      outputGain.disconnect.mockClear();

      const enabledToggle = document.getElementById('eq-enabled') as HTMLInputElement;
      enabledToggle.checked = false;
      enabledToggle.dispatchEvent(new Event('change'));

      // Should disconnect and reconnect input directly to output (bypass)
      expect(inputGain.disconnect).toHaveBeenCalled();
      expect(inputGain.connect).toHaveBeenCalledWith(outputGain);
      expect(outputGain.connect).toHaveBeenCalledWith(dest);
    });

    it('re-enables EQ when toggled back on', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);

      const inputGain = (ctx.createGain as any).mock.results[0].value;
      const filters = (ctx.createBiquadFilter as any).mock.results.map((r: any) => r.value);

      // Clear previous calls
      inputGain.connect.mockClear();
      inputGain.disconnect.mockClear();

      const enabledToggle = document.getElementById('eq-enabled') as HTMLInputElement;
      
      // Disable then re-enable
      enabledToggle.checked = false;
      enabledToggle.dispatchEvent(new Event('change'));
      
      inputGain.connect.mockClear();
      
      enabledToggle.checked = true;
      enabledToggle.dispatchEvent(new Event('change'));

      // Should reconnect through filter chain
      expect(inputGain.connect).toHaveBeenCalledWith(filters[0]);
    });
  });

  describe('getInput/getOutput & isInitialized', () => {
    it('returns null before initialization', () => {
      const module = new ParametricEQModule();
      
      expect(module.getInput()).toBeNull();
      expect(module.getOutput()).toBeNull();
      expect(module.isInitialized()).toBe(false);
    });

    it('returns gain nodes after initialization', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      expect(module.getInput()).not.toBeNull();
      expect(module.getOutput()).not.toBeNull();
      expect(module.getInput()).toHaveProperty('gain');
      expect(module.getOutput()).toHaveProperty('gain');
      expect(module.isInitialized()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles negative gain values', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      (document.getElementById('eq-mid-gain') as HTMLInputElement).value = '-12';
      
      module.initialize(ctx, dest);

      const midFilter = (ctx.createBiquadFilter as any).mock.results[2].value;
      expect(midFilter.gain.value).toBe(-12);
    });

    it('handles extreme frequency values', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      (document.getElementById('eq-low-shelf-freq') as HTMLInputElement).value = '20';
      (document.getElementById('eq-high-shelf-freq') as HTMLInputElement).value = '20000';
      
      module.initialize(ctx, dest);

      const filters = (ctx.createBiquadFilter as any).mock.results.map((r: any) => r.value);
      expect(filters[0].frequency.value).toBe(20);
      expect(filters[4].frequency.value).toBe(20000);
    });

    it('handles very narrow Q values', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      (document.getElementById('eq-mid-q') as HTMLInputElement).value = '0.1';
      
      module.initialize(ctx, dest);

      const midFilter = (ctx.createBiquadFilter as any).mock.results[2].value;
      expect(midFilter.Q.value).toBeCloseTo(0.1);
    });

    it('handles very wide Q values', () => {
      const module = new ParametricEQModule();
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      (document.getElementById('eq-mid-q') as HTMLInputElement).value = '10';
      
      module.initialize(ctx, dest);

      const midFilter = (ctx.createBiquadFilter as any).mock.results[2].value;
      expect(midFilter.Q.value).toBe(10);
    });
  });

  describe('preset configurations', () => {
    it('can be configured for bass boost', () => {
      const module = new ParametricEQModule();
      
      (document.getElementById('eq-low-shelf-gain') as HTMLInputElement).value = '6';
      (document.getElementById('eq-low-mid-gain') as HTMLInputElement).value = '3';
      (document.getElementById('eq-mid-gain') as HTMLInputElement).value = '0';
      (document.getElementById('eq-high-mid-gain') as HTMLInputElement).value = '-2';
      (document.getElementById('eq-high-shelf-gain') as HTMLInputElement).value = '-4';

      const config = module.getConfig();
      
      expect(config.lowShelf.gain).toBe(6);
      expect(config.lowMid.gain).toBe(3);
      expect(config.mid.gain).toBe(0);
      expect(config.highMid.gain).toBe(-2);
      expect(config.highShelf.gain).toBe(-4);
    });

    it('can be configured for presence boost', () => {
      const module = new ParametricEQModule();
      
      (document.getElementById('eq-low-shelf-gain') as HTMLInputElement).value = '0';
      (document.getElementById('eq-low-mid-gain') as HTMLInputElement).value = '0';
      (document.getElementById('eq-mid-gain') as HTMLInputElement).value = '2';
      (document.getElementById('eq-high-mid-gain') as HTMLInputElement).value = '4';
      (document.getElementById('eq-high-shelf-gain') as HTMLInputElement).value = '3';

      const config = module.getConfig();
      
      expect(config.lowShelf.gain).toBe(0);
      expect(config.mid.gain).toBe(2);
      expect(config.highMid.gain).toBe(4);
      expect(config.highShelf.gain).toBe(3);
    });
  });
});