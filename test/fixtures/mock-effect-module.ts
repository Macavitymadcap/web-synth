import type { BaseEffectModule, EffectNodes } from '../../src/modules/base-effect-module';

// Minimal mock that satisfies the interface
export class MockEffectModule implements BaseEffectModule {
  public initializeCalled = false;
  public initializeCallCount = 0;
  
  constructor(public name: string = 'mock') {}
  
  initialize(audioCtx: any, destination: any): EffectNodes {
    this.initializeCalled = true;
    this.initializeCallCount++;
    // Return mock objects that satisfy the interface
    return {
      input: { connect: () => {} } as any,
      output: { connect: () => {} } as any
    };
  }
  
  getInput(): any {
    return this.initializeCalled ? {} : null;
  }
  
  getOutput(): any {
    return this.initializeCalled ? {} : null;
  }
  
  isInitialized(): boolean {
    return this.initializeCalled;
  }
  
  getConfig(): any {
    return { name: this.name };
  }
}