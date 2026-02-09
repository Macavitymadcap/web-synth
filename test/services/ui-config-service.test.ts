import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { UIConfigService } from '../../src/services/ui-config-service';

describe('UIConfigService', () => {
  beforeEach(() => {
    // Clear document before each test
    document.body.innerHTML = '';
  });

  describe('getControl', () => {
    it('should get an existing control element', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.value = '42';
      document.body.appendChild(input);

      const result = UIConfigService.getControl('test-input');
      expect(result).toBe(input);
    });

    it('should throw error if element not found', () => {
      expect(() => UIConfigService.getControl('nonexistent')).toThrow(
        'Control element with id "nonexistent" not found'
      );
    });
  });

  describe('getInput', () => {
    it('should get a regular input element', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.value = '42';
      document.body.appendChild(input);

      const result = UIConfigService.getInput('test-input');
      expect(result).toBe(input);
    });

    it('should unwrap RangeControl custom element', () => {
      const rangeControl = document.createElement('range-control');
      const innerInput = document.createElement('input');
      innerInput.value = '10';
      
      rangeControl.id = 'test-range';
      (rangeControl as any).getInput = () => innerInput;
      document.body.appendChild(rangeControl);

      const result = UIConfigService.getInput('test-range');
      expect(result).toBe(innerInput);
      expect(result.value).toBe('10');
    });

    it('should throw error if input not found', () => {
      expect(() => UIConfigService.getInput('nonexistent')).toThrow(
        'Input element with id "nonexistent" not found'
      );
    });
  });

  describe('getSelect', () => {
    it('should get a select element', () => {
      const select = document.createElement('select');
      select.id = 'test-select';
      select.innerHTML = '<option value="foo">Foo</option>';
      select.value = 'foo';
      document.body.appendChild(select);

      const result = UIConfigService.getSelect('test-select');
      expect(result).toBe(select);
      expect(result.value).toBe('foo');
    });
  });

  describe('getControls', () => {
    it('should get multiple controls at once', () => {
      const input1 = document.createElement('input');
      input1.id = 'input-1';
      input1.value = '10';

      const input2 = document.createElement('input');
      input2.id = 'input-2';
      input2.value = '20';

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      const result = UIConfigService.getControls({
        first: 'input-1',
        second: 'input-2'
      });

      expect(result.first).toBe(input1);
      expect(result.second).toBe(input2);
    });
  });

  describe('getConfig', () => {
    it('should parse config from simple string IDs', () => {
      const input1 = document.createElement('input');
      input1.id = 'threshold';
      input1.value = '-18';

      const input2 = document.createElement('input');
      input2.id = 'ratio';
      input2.value = '4';

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      const result = UIConfigService.getConfig({
        threshold: 'threshold',
        ratio: 'ratio'
      });

      expect(result.threshold).toBe(-18);
      expect(result.ratio).toBe(4);
    });

    it('should apply transform functions', () => {
      const input = document.createElement('input');
      input.id = 'stages';
      input.value = '4.7';
      document.body.appendChild(input);

      const result = UIConfigService.getConfig({
        stages: {
          id: 'stages',
          transform: (v) => Math.round(Number.parseFloat(v))
        }
      });

      expect(result.stages).toBe(5);
    });

    it('should handle select elements', () => {
      const select = document.createElement('select');
      select.id = 'filter-type';
      select.innerHTML = '<option value="LOWPASS">Low Pass</option>';
      select.value = 'LOWPASS';
      document.body.appendChild(select);

      const result = UIConfigService.getConfig({
        filterType: {
          id: 'filter-type',
          select: true,
          transform: (v) => v.toLowerCase()
        }
      });

      expect(result.filterType).toBe('lowpass');
    });

    it('should handle mixed config types', () => {
      const input1 = document.createElement('input');
      input1.id = 'simple';
      input1.value = '10';

      const input2 = document.createElement('input');
      input2.id = 'transformed';
      input2.value = '5';

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      const result = UIConfigService.getConfig({
        simple: 'simple',
        transformed: {
          id: 'transformed',
          transform: (v) => Number.parseFloat(v) * 2
        }
      });

      expect(result.simple).toBe(10);
      expect(result.transformed).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if element exists', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);

      expect(UIConfigService.exists('test-input')).toBe(true);
    });

    it('should return false if element does not exist', () => {
      expect(UIConfigService.exists('nonexistent')).toBe(false);
    });
  });

  describe('tryGetControl', () => {
    it('should return element if it exists', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);

      const result = UIConfigService.tryGetControl('test-input');
      expect(result).toBe(input);
    });

    it('should return null if element does not exist', () => {
      const result = UIConfigService.tryGetControl('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('tryGetInput', () => {
    it('should return input if it exists', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);

      const result = UIConfigService.tryGetInput('test-input');
      expect(result).toBe(input);
    });

    it('should return null if input does not exist', () => {
      const result = UIConfigService.tryGetInput('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('bindAudioParam', () => {
    it('should bind input to AudioParam', () => {
      const input = document.createElement('input');
      input.id = 'test-param';
      input.value = '10';
      document.body.appendChild(input);

      const mockParam = { value: 0 };
      UIConfigService.bindAudioParam({
        elementId: 'test-param',
        audioParam: () => mockParam as AudioParam
      });

      // Trigger input event
      input.value = '42';
      input.dispatchEvent(new Event('input'));

      expect(mockParam.value).toBe(42);
    });

    it('should apply transform function', () => {
      const input = document.createElement('input');
      input.id = 'test-param';
      input.value = '10';
      document.body.appendChild(input);

      const mockParam = { value: 0 };
      UIConfigService.bindAudioParam({
        elementId: 'test-param',
        audioParam: () => mockParam as AudioParam,
        transform: (v) => Number.parseFloat(v) * 2
      });

      input.value = '5';
      input.dispatchEvent(new Event('input'));

      expect(mockParam.value).toBe(10);
    });

    it('should not throw if audioParam returns null', () => {
      const input = document.createElement('input');
      input.id = 'test-param';
      input.value = '10';
      document.body.appendChild(input);

      UIConfigService.bindAudioParam({
        elementId: 'test-param',
        audioParam: () => null
      });

      expect(() => {
        input.dispatchEvent(new Event('input'));
      }).not.toThrow();
    });

    it('should use custom event name', () => {
      const input = document.createElement('input');
      input.id = 'test-param';
      input.value = '10';
      document.body.appendChild(input);

      const mockParam = { value: 0 };
      UIConfigService.bindAudioParam({
        elementId: 'test-param',
        audioParam: () => mockParam as AudioParam,
        event: 'change'
      });

      input.value = '42';
      input.dispatchEvent(new Event('change'));

      expect(mockParam.value).toBe(42);
    });
  });

  describe('bindAudioParams', () => {
    it('should bind multiple AudioParams', () => {
      const input1 = document.createElement('input');
      input1.id = 'param-1';
      input1.value = '10';

      const input2 = document.createElement('input');
      input2.id = 'param-2';
      input2.value = '20';

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      const mockParam1 = { value: 0 };
      const mockParam2 = { value: 0 };

      UIConfigService.bindAudioParams([
        {
          elementId: 'param-1',
          audioParam: () => mockParam1 as AudioParam
        },
        {
          elementId: 'param-2',
          audioParam: () => mockParam2 as AudioParam
        }
      ]);

      input1.dispatchEvent(new Event('input'));
      input2.dispatchEvent(new Event('input'));

      expect(mockParam1.value).toBe(10);
      expect(mockParam2.value).toBe(20);
    });
  });

  describe('bindGainParam', () => {
    it('should bind to GainNode gain parameter', () => {
      const input = document.createElement('input');
      input.id = 'gain-param';
      input.value = '0.5';
      document.body.appendChild(input);

      const mockGainNode = {
        gain: { value: 1 }
      };

      UIConfigService.bindGainParam({
        elementId: 'gain-param',
        gainNode: () => mockGainNode as GainNode
      });

      input.dispatchEvent(new Event('input'));

      expect(mockGainNode.gain.value).toBe(0.5);
    });
  });

  describe('onInput', () => {
    it('should call handler with element and value', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.value = '42';
      document.body.appendChild(input);

      const handler = jest.fn();
      UIConfigService.onInput('test-input', handler);

      input.dispatchEvent(new Event('input'));

      expect(handler).toHaveBeenCalledWith(input, '42');
    });

    it('should use custom event name', () => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.value = '42';
      document.body.appendChild(input);

      const handler = jest.fn();
      UIConfigService.onInput('test-input', handler, 'change');

      input.dispatchEvent(new Event('change'));

      expect(handler).toHaveBeenCalledWith(input, '42');
    });
  });

  describe('onInputs', () => {
    it('should set up multiple input handlers', () => {
      const input1 = document.createElement('input');
      input1.id = 'input-1';
      input1.value = '10';

      const input2 = document.createElement('input');
      input2.id = 'input-2';
      input2.value = '20';

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      const handler1 = jest.fn();
      const handler2 = jest.fn();

      UIConfigService.onInputs({
        'input-1': handler1,
        'input-2': handler2
      });

      input1.dispatchEvent(new Event('input'));
      input2.dispatchEvent(new Event('input'));

      expect(handler1).toHaveBeenCalledWith(input1, '10');
      expect(handler2).toHaveBeenCalledWith(input2, '20');
    });
  });

  describe('onSelect', () => {
    it('should call handler on select change', () => {
      const select = document.createElement('select');
      select.id = 'test-select';
      select.innerHTML = '<option value="foo">Foo</option><option value="bar">Bar</option>';
      select.value = 'foo';
      document.body.appendChild(select);

      const handler = jest.fn();
      UIConfigService.onSelect('test-select', handler);

      select.value = 'bar';
      select.dispatchEvent(new Event('change'));

      expect(handler).toHaveBeenCalledWith(select, 'bar');
    });
  });
});