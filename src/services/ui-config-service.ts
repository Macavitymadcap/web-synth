/**
 * UIConfigService provides centralized access to UI elements for modules
 * This decouples modules from direct DOM access, making them more testable
 * 
 * Optional helper methods reduce boilerplate for common patterns like
 * binding UI elements to AudioParam values
 */
export class UIConfigService {
  // ========================================
  // ELEMENT ACCESS METHODS
  // ========================================

  /**
   * Get a single control element by ID
   * @param id - The element ID
   * @returns The HTMLInputElement or HTMLSelectElement
   * @throws Error if element is not found
   */
  static getControl<T extends HTMLElement = HTMLInputElement>(id: string): T {
    const element = document.getElementById(id);
    
    if (!element) {
      throw new Error(`Control element with id "${id}" not found`);
    }
    
    return element as T;
  }

  /**
   * Get an input element, unwrapping from RangeControl if necessary
   * @param id - The element ID
   * @returns The underlying HTMLInputElement
   */
  static getInput(id: string): HTMLInputElement {
    const element = document.getElementById(id);
    
    if (!element) {
      throw new Error(`Input element with id "${id}" not found`);
    }
    
    // Check if it's a RangeControl custom element
    if (element.tagName.toLowerCase() === 'range-control') {
      const rangeControl = element as any;
      if (typeof rangeControl.getInput === 'function') {
        return rangeControl.getInput();
      }
    }
    
    return element as HTMLInputElement;
  }

  /**
   * Get a select element
   * @param id - The element ID
   * @returns The HTMLSelectElement
   */
  static getSelect(id: string): HTMLSelectElement {
    return this.getControl<HTMLSelectElement>(id);
  }

  /**
   * Get multiple controls at once
   * @param ids - Object mapping keys to element IDs
   * @returns Object with the same keys, but values are the actual elements
   */
  static getControls<T extends Record<string, string>>(
    ids: T
  ): { [K in keyof T]: HTMLInputElement | HTMLSelectElement } {
    const result = {} as any;
    
    for (const [key, id] of Object.entries(ids)) {
      result[key] = this.getInput(id);
    }
    
    return result;
  }

  /**
   * Get configuration from multiple inputs at once
   * @param config - Object mapping keys to element IDs and optional transform functions
   * @returns Object with the same keys, but values are the parsed/transformed values
   */
  static getConfig<T extends Record<string, ConfigValue>>(
    config: T
  ): { [K in keyof T]: any } {
    const result = {} as any;
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string') {
        // Simple ID - get the value as float
        const element = this.getInput(value);
        result[key] = Number.parseFloat(element.value);
      } else {
        // Object with id and transform
        const element = value.select 
          ? this.getSelect(value.id)
          : this.getInput(value.id);
        
        const rawValue = element.value;
        result[key] = value.transform 
          ? value.transform(rawValue) 
          : Number.parseFloat(rawValue);
      }
    }
    
    return result;
  }

  // ========================================
  // SAFE ACCESS METHODS
  // ========================================

  /**
   * Check if an element exists
   * @param id - The element ID
   * @returns True if the element exists, false otherwise
   */
  static exists(id: string): boolean {
    return document.getElementById(id) !== null;
  }

  /**
   * Safely get a control, returning null if not found
   * @param id - The element ID
   * @returns The element or null
   */
  static tryGetControl<T extends HTMLElement = HTMLInputElement>(id: string): T | null {
    try {
      return this.getControl<T>(id);
    } catch {
      return null;
    }
  }

  /**
   * Safely get an input, returning null if not found
   * @param id - The element ID
   * @returns The input element or null
   */
  static tryGetInput(id: string): HTMLInputElement | null {
    try {
      return this.getInput(id);
    } catch {
      return null;
    }
  }

  // ========================================
  // EVENT LISTENER HELPER METHODS (OPTIONAL)
  // ========================================

  /**
   * Bind an element to an AudioParam
   * Common pattern: input element changes -> AudioParam.value updates
   * 
   * @example
   * UIConfigService.bindAudioParam({
   *   elementId: 'compressor-threshold',
   *   audioParam: () => this.compressor?.threshold
   * });
   */
  static bindAudioParam(config: AudioParamBinding): void {
    const element = this.getInput(config.elementId);
    const eventName = config.event || 'input';
    
    element.addEventListener(eventName, () => {
      const param = config.audioParam();
      if (param) {
        const rawValue = element.value;
        const finalValue = config.transform 
          ? config.transform(rawValue)
          : Number.parseFloat(rawValue);
        param.value = finalValue;
      }
    });
  }

  /**
   * Bind multiple AudioParams at once
   * Convenience method for modules with many parameters
   * 
   * @example
   * UIConfigService.bindAudioParams([
   *   { elementId: 'threshold', audioParam: () => this.compressor?.threshold },
   *   { elementId: 'ratio', audioParam: () => this.compressor?.ratio }
   * ]);
   */
  static bindAudioParams(bindings: AudioParamBinding[]): void {
    bindings.forEach(binding => this.bindAudioParam(binding));
  }

  /**
   * Bind an element to a GainNode's gain parameter
   * Very common pattern worth its own helper method
   * 
   * @example
   * UIConfigService.bindGainParam({
   *   elementId: 'master-volume',
   *   gainNode: () => this.masterGain
   * });
   */
  static bindGainParam(config: GainParamBinding): void {
    this.bindAudioParam({
      elementId: config.elementId,
      audioParam: () => config.gainNode()?.gain,
      transform: config.transform,
      event: config.event
    });
  }

  /**
   * Set up a custom event listener with automatic element retrieval
   * For cases that don't fit the AudioParam pattern
   * 
   * @example
   * UIConfigService.onInput('chorus-mix', (element, value) => {
   *   const mix = parseFloat(value);
   *   if (this.wetGain && this.dryGain) {
   *     this.wetGain.gain.value = mix;
   *     this.dryGain.gain.value = 1 - mix;
   *   }
   * });
   */
  static onInput(
    elementId: string, 
    handler: (element: HTMLInputElement, value: string) => void,
    event: string = 'input'
  ): void {
    const element = this.getInput(elementId);
    element.addEventListener(event, () => {
      handler(element, element.value);
    });
  }

  /**
   * Set up custom event listeners for multiple elements
   * 
   * @example
   * UIConfigService.onInputs({
   *   'param1': (el, val) => this.handleParam1(val),
   *   'param2': (el, val) => this.handleParam2(val)
   * });
   */
  static onInputs(
    handlers: Record<string, (element: HTMLInputElement, value: string) => void>,
    event: string = 'input'
  ): void {
    for (const [elementId, handler] of Object.entries(handlers)) {
      this.onInput(elementId, handler, event);
    }
  }

  /**
   * Bind an element to a select element with custom change handler
   * 
   * @example
   * UIConfigService.onSelect('filter-type', (element, value) => {
   *   if (this.filter) {
   *     this.filter.type = value as BiquadFilterType;
   *   }
   * });
   */
  static onSelect(
    elementId: string,
    handler: (element: HTMLSelectElement, value: string) => void
  ): void {
    const element = this.getSelect(elementId);
    element.addEventListener('change', () => {
      handler(element, element.value);
    });
  }
}

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Type for config value - either a simple ID string or an object with transform
 */
export type ConfigValue = 
  | string 
  | { 
      id: string; 
      transform?: (value: string) => any;
      select?: boolean; // If true, treat as select element
    };

/**
 * Configuration for binding an element to an AudioParam
 */
export interface AudioParamBinding {
  /** ID of the element to bind */
  elementId: string;
  
  /** Function that returns the AudioParam to update */
  audioParam: () => AudioParam | undefined | null;
  
  /** Optional transform function to process the string value */
  transform?: (value: string) => number;
  
  /** Event to listen for (default: 'input') */
  event?: string;
}

/**
 * Configuration for binding an element to a GainNode's gain parameter
 */
export interface GainParamBinding {
  /** ID of the element to bind */
  elementId: string;
  
  /** Function that returns the GainNode to update */
  gainNode: () => GainNode | undefined | null;
  
  /** Optional transform function to process the string value */
  transform?: (value: string) => number;
  
  /** Event to listen for (default: 'input') */
  event?: string;
}