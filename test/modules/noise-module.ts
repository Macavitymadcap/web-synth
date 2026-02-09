import { describe, expect, it, beforeEach } from 'bun:test';
import { NoiseModule } from '../../src/modules/noise-module';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('NoiseModule', () => {
  let noiseModule: NoiseModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';

    // Create required input elements
    const typeSelect = document.createElement('select');
    typeSelect.id = 'noise-type';
    const whiteOption = document.createElement('option');
    whiteOption.value = 'white';
    whiteOption.textContent = 'White';
    const pinkOption = document.createElement('option');
    pinkOption.value = 'pink';
    pinkOption.textContent = 'Pink';
    const brownOption = document.createElement('option');
    brownOption.value = 'brown';
    brownOption.textContent = 'Brown';
    typeSelect.appendChild(whiteOption);
    typeSelect.appendChild(pinkOption);
    typeSelect.appendChild(brownOption);
    document.body.appendChild(typeSelect);

    const levelInput = document.createElement('input');
    levelInput.id = 'noise-level';
    levelInput.type = 'range';
    levelInput.value = '0.5';
    document.body.appendChild(levelInput);

    const enabledInput = document.createElement('input');
    enabledInput.id = 'noise-enabled';
    enabledInput.type = 'checkbox';
    enabledInput.checked = true;
    document.body.appendChild(enabledInput);

    noiseModule = new NoiseModule();
  });

  describe('getConfig', () => {
    it('returns correct initial config', () => {
      const config = noiseModule.getConfig();
      
      expect(config.type).toBe('white');
      expect(config.level).toBe(0.5);
      expect(config.enabled).toBe(true);
    });

    it('returns updated config after changes', () => {
      const typeEl = document.getElementById('noise-type') as HTMLSelectElement;
      const levelEl = document.getElementById('noise-level') as HTMLInputElement;
      const enabledEl = document.getElementById('noise-enabled') as HTMLInputElement;

      typeEl.value = 'pink';
      levelEl.value = '0.7';
      enabledEl.checked = false;

      const config = noiseModule.getConfig();
      
      expect(config.type).toBe('pink');
      expect(config.level).toBe(0.7);
      expect(config.enabled).toBe(false);
    });
  });

  describe('createNoiseSource', () => {
    it('returns null when disabled', () => {
      const enabledEl = document.getElementById('noise-enabled') as HTMLInputElement;
      enabledEl.checked = false;

      const ctx = createMockAudioCtx();
      const result = noiseModule.createNoiseSource(ctx);
      
      expect(result).toBeNull();
    });

    it('creates source and gain when enabled', () => {
      const ctx = createMockAudioCtx();
      const result = noiseModule.createNoiseSource(ctx);
      
      expect(result).not.toBeNull();
      expect(result!.source).toBeDefined();
      expect(result!.gain).toBeDefined();
    });

    it('sets source to loop', () => {
      const ctx = createMockAudioCtx();
      const result = noiseModule.createNoiseSource(ctx);
      
      expect(result!.source.loop).toBe(true);
    });

    it('sets gain value to configured level', () => {
      const levelEl = document.getElementById('noise-level') as HTMLInputElement;
      levelEl.value = '0.7';

      const ctx = createMockAudioCtx();
      const result = noiseModule.createNoiseSource(ctx);
      
      expect(result!.gain.gain.value).toBe(0.7);
    });

    it('connects source to gain', () => {
      const ctx = createMockAudioCtx();
      const result = noiseModule.createNoiseSource(ctx);
      
      expect(result!.source.connect).toHaveBeenCalledWith(result!.gain);
    });

    it('creates buffer with correct length', () => {
      const ctx = createMockAudioCtx();
      noiseModule.createNoiseSource(ctx);
      
      expect(ctx.createBuffer).toHaveBeenCalledWith(1, ctx.sampleRate * 2, ctx.sampleRate);
    });

    it('caches buffer for same type', () => {
      const ctx = createMockAudioCtx();
      
      const result1 = noiseModule.createNoiseSource(ctx);
      const buffer1 = result1!.source.buffer;
      
      const result2 = noiseModule.createNoiseSource(ctx);
      const buffer2 = result2!.source.buffer;
      
      expect(buffer1).toBe(buffer2);
    });

    it('regenerates buffer when type changes', () => {
      const ctx = createMockAudioCtx();
      const typeEl = document.getElementById('noise-type') as HTMLSelectElement;
      
      const result1 = noiseModule.createNoiseSource(ctx);
      const buffer1 = result1!.source.buffer;
      
      // Change type and trigger cache invalidation
      typeEl.value = 'pink';
      typeEl.dispatchEvent(new Event('input'));
      
      const result2 = noiseModule.createNoiseSource(ctx);
      const buffer2 = result2!.source.buffer;
      
      expect(buffer1).not.toBe(buffer2);
    });
  });

  describe('noise generation algorithms', () => {
    it('generates white noise with values in range', () => {
      const ctx = createMockAudioCtx();
      const result = noiseModule.createNoiseSource(ctx);
      const buffer = result!.source.buffer as AudioBuffer;
      const data = buffer.getChannelData(0);
      
      // Check all values are in valid range
      const allInRange = Array.from(data).every(v => v >= -1 && v <= 1);
      expect(allInRange).toBe(true);
      
      // Check there's actual variation
      const hasVariation = data.some(v => Math.abs(v) > 0.1);
      expect(hasVariation).toBe(true);
    });

    it('generates pink noise with values in range', () => {
      const ctx = createMockAudioCtx();
      const typeEl = document.getElementById('noise-type') as HTMLSelectElement;
      typeEl.value = 'pink';
      
      const result = noiseModule.createNoiseSource(ctx);
      const buffer = result!.source.buffer as AudioBuffer;
      const data = buffer.getChannelData(0);
      
      // Check all values are in valid range
      const allInRange = Array.from(data).every(v => v >= -1 && v <= 1);
      expect(allInRange).toBe(true);
      
      // Check there's actual variation
      const hasVariation = data.some(v => Math.abs(v) > 0.1);
      expect(hasVariation).toBe(true);
    });

    it('generates brown noise with smooth transitions', () => {
      const ctx = createMockAudioCtx();
      const typeEl = document.getElementById('noise-type') as HTMLSelectElement;
      typeEl.value = 'brown';
      
      const result = noiseModule.createNoiseSource(ctx);
      const buffer = result!.source.buffer as AudioBuffer;
      const data = buffer.getChannelData(0);
      
      // Brown noise should show correlation between adjacent samples
      let smallDifferenceCount = 0;
      const sampleSize = Math.min(1000, data.length - 1);
      
      for (let i = 1; i < sampleSize; i++) {
        if (Math.abs(data[i] - data[i - 1]) < 0.2) {
          smallDifferenceCount++;
        }
      }
      
      // Should have significant correlation (>60%)
      const correlationRatio = smallDifferenceCount / sampleSize;
      expect(correlationRatio).toBeGreaterThan(0.6);
    });

    it('generates different patterns for different noise types', () => {
      const ctx = createMockAudioCtx();
      const typeEl = document.getElementById('noise-type') as HTMLSelectElement;
      
      // Generate white noise
      typeEl.value = 'white';
      const whiteResult = noiseModule.createNoiseSource(ctx);
      const whiteData = whiteResult!.source.buffer!.getChannelData(0);
      
      // Change type to trigger regeneration
      typeEl.value = 'pink';
      typeEl.dispatchEvent(new Event('input'));
      
      // Generate pink noise
      const pinkResult = noiseModule.createNoiseSource(ctx);
      const pinkData = pinkResult!.source.buffer!.getChannelData(0);
      
      // Check that buffers are different
      let differenceCount = 0;
      const sampleSize = Math.min(100, whiteData.length);
      
      for (let i = 0; i < sampleSize; i++) {
        if (whiteData[i] !== pinkData[i]) {
          differenceCount++;
        }
      }
      
      // Should be mostly different (>95%)
      expect(differenceCount / sampleSize).toBeGreaterThan(0.95);
    });
  });

  describe('parameter listeners', () => {
    it('invalidates cache when type changes', () => {
      const ctx = createMockAudioCtx();
      const typeEl = document.getElementById('noise-type') as HTMLSelectElement;
      
      // Create initial buffer
      const result1 = noiseModule.createNoiseSource(ctx);
      const buffer1 = result1!.source.buffer;
      
      // Change type
      typeEl.value = 'brown';
      typeEl.dispatchEvent(new Event('input'));
      
      // Create new source - should have different buffer
      const result2 = noiseModule.createNoiseSource(ctx);
      const buffer2 = result2!.source.buffer;
      
      expect(buffer1).not.toBe(buffer2);
    });

    it('does not regenerate buffer when level changes', () => {
      const ctx = createMockAudioCtx();
      const levelEl = document.getElementById('noise-level') as HTMLInputElement;
      
      // Create initial buffer
      const result1 = noiseModule.createNoiseSource(ctx);
      const buffer1 = result1!.source.buffer;
      
      // Change level
      levelEl.value = '0.8';
      levelEl.dispatchEvent(new Event('input'));
      
      // Create new source - should reuse buffer
      const result2 = noiseModule.createNoiseSource(ctx);
      const buffer2 = result2!.source.buffer;
      
      expect(buffer1).toBe(buffer2);
    });

    it('does not regenerate buffer when enabled toggles', () => {
      const ctx = createMockAudioCtx();
      const enabledEl = document.getElementById('noise-enabled') as HTMLInputElement;
      
      // Create initial buffer
      const result1 = noiseModule.createNoiseSource(ctx);
      const buffer1 = result1!.source.buffer;
      
      // Toggle off and on
      enabledEl.checked = false;
      enabledEl.dispatchEvent(new Event('input'));
      enabledEl.checked = true;
      enabledEl.dispatchEvent(new Event('input'));
      
      // Create new source - should reuse buffer
      const result2 = noiseModule.createNoiseSource(ctx);
      const buffer2 = result2!.source.buffer;
      
      expect(buffer1).toBe(buffer2);
    });
  });
});