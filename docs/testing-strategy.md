# Testing Strategy for Web Audio Synth

## Philosophy: Test What Matters

Web Audio API testing presents a unique challenge: heavy mocking proves very little about whether audio actually works. Here's our pragmatic approach.

## ✅ What We Test (Unit Tests)

### Business Logic
Focus on the **manager's responsibilities**, not audio routing:

1. **Registration logic**
   - Can register effects
   - Prevents duplicate IDs
   - Validates metadata

2. **Ordering logic**
   - Sorts effects correctly
   - Maintains registration order
   - Respects order values

3. **Query logic**
   - Find by ID
   - Filter by category
   - Get sorted lists
   - Count effects

4. **State management**
   - Initialization flag
   - Prevents late registration
   - Status reporting

### Why This Works
- These tests don't require Web Audio API
- They verify the manager does its job correctly
- If these pass, audio routing *should* work
- Fast to run, easy to maintain

## ❌ What We Don't Test (Unit Tests)

### Audio Routing
We **don't** extensively mock Web Audio API because:

1. **Mocks don't prove audio works**
   ```typescript
   // This test tells you nothing useful:
   expect(mockGainNode.connect).toHaveBeenCalledWith(mockDestination);
   // Does the audio actually flow? No idea.
   ```

2. **Mocking is complex and brittle**
   ```typescript
   // You end up with 100+ lines of mock setup:
   class MockGainNode {
     gain = { value: 1, setValueAtTime: jest.fn(), ... };
     connect = jest.fn();
     disconnect = jest.fn();
     // ... 20 more properties
   }
   ```

3. **Real browser behavior differs**
   - Timing issues
   - Sample rate variations
   - Context state changes
   - None of this is captured in mocks

## ✅ What We Test (Manual/Browser)

### Integration Testing
Real browser testing tells you what matters:

1. **Create a test page**
   ```typescript
   // test-synth.html
   import { EffectsManager } from './core/effects-manager';
   
   const manager = new EffectsManager();
   // ... register effects
   
   // Play a note
   button.addEventListener('click', () => {
     synth.playNote('C4');
   });
   ```

2. **Test checklist**
   - [ ] Sound plays
   - [ ] Effects are audible
   - [ ] Order is correct (delay after reverb sounds different)
   - [ ] Console shows no errors
   - [ ] Chain printout looks correct

3. **Visual inspection**
   - Watch spectrum analyser
   - Listen for artifacts
   - Check effect parameters respond

### Why This Works
- Tests real Web Audio API
- Catches actual audio issues
- Verifies user experience
- Shows visual feedback works

## 📋 Recommended Testing Flow

### Development
```bash
# 1. Run unit tests (fast feedback loop)
bun test

# 2. Start dev server
bun run dev

# 3. Manual testing checklist:
#    - Play notes
#    - Adjust each effect
#    - Check spectrum analyser
#    - Test presets
#    - Verify recording
```

### Before Commit
```bash
# Unit tests must pass
bun test

# Smoke test in browser
# - Play a note
# - Check one effect works
# - No console errors
```

### Before Release
Full manual test suite:
- [ ] All effects audible
- [ ] Effect order correct
- [ ] Presets load
- [ ] Recording works
- [ ] MIDI input works
- [ ] Mobile compatible

## 🎯 Example: What We Actually Test

### Unit Test (Fast, Focused)
```typescript
it('should register effects in order', () => {
  manager.register(effect1, { order: 100, ... });
  manager.register(effect2, { order: 50, ... });
  
  const sorted = manager.getEffectsByOrder();
  expect(sorted[0].order).toBe(50);
  expect(sorted[1].order).toBe(100);
});
```
**This proves:** The manager sorts correctly.

### Manual Test (Slower, Comprehensive)
```typescript
// In browser console or test page:
effectsManager.printChain();
// Output:
// 1. Chorus (order 100)
// 2. Delay (order 80)
// 3. Reverb (order 50)

synth.playNote('C4');
// Listen: You hear chorus → delay → reverb
```
**This proves:** Audio actually flows in the right order.

## 🔧 When to Add More Tests

### Add unit tests when:
- Logic gets complex (e.g., dynamic effect routing)
- Adding effect presets/configurations
- Implementing effect bypass
- Building effect chains UI

### Don't add unit tests for:
- Web Audio node connections
- Audio parameter changes
- Signal flow
- Audio processing algorithms

These need real browser testing.

## 📦 Test Organization

```
test/
├── effects-manager.test.ts          # Business logic only
├── effect-module-adapter.test.ts    # Adapter logic
├── settings-manager.test.ts         # Settings serialization
└── manual/
    ├── audio-integration.html       # Browser tests
    └── test-checklist.md            # Manual test steps
```

## 🎵 The Bottom Line

**Unit tests prove your manager manages.**  
**Manual tests prove your synth synthesizes.**

Both are necessary, but trying to unit test audio routing is like:
- Testing a car by verifying the steering wheel turns
- But never actually driving it

The steering wheel test is fast and useful, but it doesn't prove the car moves. You need to drive it too.

## Example Test Command

```bash
# Fast feedback: Run unit tests
bun test

# Real validation: Open in browser
bun run dev
# Then: Press keys, hear sound, check effects work
```

If unit tests pass and manual testing sounds good, you're good to ship! 🚀