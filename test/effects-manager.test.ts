/**
 * EffectsManager Tests - Focused on Business Logic
 * 
 * We don't mock Web Audio API extensively because:
 * 1. Mocks don't prove the audio actually works
 * 2. Web Audio integration is tested in browser/manual testing
 * 3. Focus on: registration, ordering, querying - the manager's actual job
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { EffectsManager } from '../src/core/effects-manager';
import { MockEffectModule } from './fixtures/mock-effect-module';


describe('EffectsManager - Business Logic', () => {
  let manager: EffectsManager;
  
  beforeEach(() => {
    manager = new EffectsManager();
  });
  
  describe('Registration', () => {
    it('should register effects successfully', () => {
      const effect = new MockEffectModule('test');
      
      manager.register(effect, {
        id: 'test-effect',
        name: 'Test Effect',
        order: 100,
        category: 'modulation'
      });
      
      expect(manager.getEffectCount()).toBe(1);
      expect(manager.getEffect('test-effect')).toBe(effect);
    });
    
    it('should prevent duplicate effect IDs', () => {
      const effect1 = new MockEffectModule('effect1');
      const effect2 = new MockEffectModule('effect2');
      
      manager.register(effect1, {
        id: 'duplicate',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      expect(() => {
        manager.register(effect2, {
          id: 'duplicate',
          name: 'Effect 2',
          order: 90,
          category: 'modulation'
        });
      }).toThrow('already registered');
    });
    
    it('should allow multiple effects with different IDs', () => {
      manager.register(new MockEffectModule(), {
        id: 'effect1',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      manager.register(new MockEffectModule(), {
        id: 'effect2',
        name: 'Effect 2',
        order: 90,
        category: 'modulation'
      });
      
      expect(manager.getEffectCount()).toBe(2);
    });
  });
  
  describe('Ordering', () => {
    it('should return effects sorted by order', () => {
      manager.register(new MockEffectModule('b'), {
        id: 'effect-b',
        name: 'B',
        order: 50,
        category: 'modulation'
      });
      
      manager.register(new MockEffectModule('a'), {
        id: 'effect-a',
        name: 'A',
        order: 100,
        category: 'modulation'
      });
      
      manager.register(new MockEffectModule('c'), {
        id: 'effect-c',
        name: 'C',
        order: 25,
        category: 'modulation'
      });
      
      const sorted = manager.getEffectsByOrder();
      
      expect(sorted[0].metadata.id).toBe('effect-c'); // order 25
      expect(sorted[1].metadata.id).toBe('effect-b'); // order 50
      expect(sorted[2].metadata.id).toBe('effect-a'); // order 100
    });
  });
  
  describe('Filtering', () => {
    beforeEach(() => {
      manager.register(new MockEffectModule(), {
        id: 'chorus',
        name: 'Chorus',
        order: 100,
        category: 'modulation'
      });
      
      manager.register(new MockEffectModule(), {
        id: 'delay',
        name: 'Delay',
        order: 90,
        category: 'time-based'
      });
      
      manager.register(new MockEffectModule(), {
        id: 'phaser',
        name: 'Phaser',
        order: 80,
        category: 'modulation'
      });
      
      manager.register(new MockEffectModule(), {
        id: 'compressor',
        name: 'Compressor',
        order: 70,
        category: 'dynamics'
      });
    });
    
    it('should filter effects by category', () => {
      const modulationFX = manager.getEffectsByCategory('modulation');
      const timeBasedFX = manager.getEffectsByCategory('time-based');
      const dynamicsFX = manager.getEffectsByCategory('dynamics');
      
      expect(modulationFX.length).toBe(2);
      expect(timeBasedFX.length).toBe(1);
      expect(dynamicsFX.length).toBe(1);
    });
    
    it('should return effects in order within category', () => {
      const modulationFX = manager.getEffectsByCategory('modulation');
      
      expect(modulationFX[0].metadata.name).toBe('Phaser'); // order 80
      expect(modulationFX[1].metadata.name).toBe('Chorus'); // order 100
    });
    
    it('should return empty array for non-existent category', () => {
      const results = manager.getEffectsByCategory('non-existent' as any);
      expect(results.length).toBe(0);
    });
  });
  
  describe('Querying', () => {
    it('should get effect by ID', () => {
      const effect = new MockEffectModule('test');
      manager.register(effect, {
        id: 'my-effect',
        name: 'My Effect',
        order: 100,
        category: 'modulation'
      });
      
      expect(manager.getEffect('my-effect')).toBe(effect);
    });
    
    it('should return undefined for non-existent effect', () => {
      expect(manager.getEffect('does-not-exist')).toBeUndefined();
    });
    
    it('should get all effects', () => {
      manager.register(new MockEffectModule(), {
        id: 'effect1',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      manager.register(new MockEffectModule(), {
        id: 'effect2',
        name: 'Effect 2',
        order: 90,
        category: 'modulation'
      });
      
      const all = manager.getAllEffects();
      expect(all.length).toBe(2);
    });
    
    it('should get effect count', () => {
      expect(manager.getEffectCount()).toBe(0);
      
      manager.register(new MockEffectModule(), {
        id: 'effect1',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      expect(manager.getEffectCount()).toBe(1);
    });
  });
  
  describe('Initialization State', () => {
    it('should not be initialized before initialize() is called', () => {
      manager.register(new MockEffectModule(), {
        id: 'effect1',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      expect(manager.isInitialized()).toBe(false);
    });
    
    it('should prevent registration after initialization', () => {
      manager.register(new MockEffectModule(), {
        id: 'effect1',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      // Initialize with minimal mock context
      const mockCtx = { createGain: () => ({ connect: () => {} }) } as any;
      const mockDest = { connect: () => {} } as any;
      manager.initialize(mockCtx, mockDest);
      
      expect(manager.isInitialized()).toBe(true);
      
      expect(() => {
        manager.register(new MockEffectModule(), {
          id: 'effect2',
          name: 'Effect 2',
          order: 90,
          category: 'modulation'
        });
      }).toThrow('Cannot register effects after initialization');
    });
  });
  
  describe('Status', () => {
    it('should provide effect status information', () => {
      const effect1 = new MockEffectModule('effect1');
      const effect2 = new MockEffectModule('effect2');
      
      manager.register(effect1, {
        id: 'effect1',
        name: 'Effect 1',
        order: 100,
        category: 'modulation'
      });
      
      manager.register(effect2, {
        id: 'effect2',
        name: 'Effect 2',
        order: 90,
        category: 'modulation'
      });
      
      const statusBefore = manager.getStatus();
      expect(statusBefore[0].initialized).toBe(false);
      expect(statusBefore[1].initialized).toBe(false);
      
      // Initialize
      const mockCtx = { createGain: () => ({ connect: () => {} }) } as any;
      const mockDest = { connect: () => {} } as any;
      manager.initialize(mockCtx, mockDest);
      
      const statusAfter = manager.getStatus();
      expect(statusAfter[0].initialized).toBe(true);
      expect(statusAfter[1].initialized).toBe(true);
    });
  });
});