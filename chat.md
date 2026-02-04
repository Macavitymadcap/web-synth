Looking at your code, I can see an opportunity to refactor the `Synth` class into smaller, more focused modules. Here's my proposed architecture:

## Proposed Architecture

Break out each major synthesizer module into its own class that can be injected as dependencies:

1. **EnvelopeModule** - Handles ADSR envelope generation
2. **FilterModule** - Manages filter and filter envelope
3. **LFOModule** - Controls LFO and its routing
4. **DelayModule** - Handles delay effect
5. **MasterModule** - Controls master gain and audio context
6. **VoiceManager** - Manages active voices and polyphony

This would make the `Synth` class primarily a coordinator that:
- Orchestrates these modules
- Handles note on/off events
- Connects modules together in the audio graph

## Benefits

- **Single Responsibility**: Each module handles one aspect of synthesis
- **Easier Testing**: Test each module independently
- **Reusability**: Modules could be reused in other synth projects
- **Maintainability**: Changes to one module don't affect others
- **Extensibility**: Easy to add new modules (chorus, reverb, etc.)

## Suggested File Structure
- envelope-module.ts
- filter-module.ts
- lfo-module.ts
- delay-module.ts
- master-module.ts
- voice-manager.ts