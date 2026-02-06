# Expansions

## Sound Generation & Processing

**Noise Generator**
- White, pink, brown noise sources
- Useful for percussion, wind sounds, and sound design
- Uses `AudioBufferSourceNode` with generated noise buffers

**Ring Modulator**
- Multiplies two signals for metallic, bell-like tones
- Implemented with `GainNode` and oscillators
- Creates inharmonic, robotic sounds

## Time-Based Effects

**Phaser**
- Sweeping notch filter effect
- Uses multiple `BiquadFilterNode` (allpass filters)
- Classic analog synth sound

**Flanger**
- Short delay with feedback and modulation
- Similar to chorus but with more dramatic sweeping
- Uses `DelayNode` with LFO modulation

## Dynamics & Amplitude

**Tremolo**
- Amplitude modulation (volume wobble)
- Uses `GainNode` modulated by LFO
- Classic guitar amp effect

**Gate/Noise Gate**
- Cuts signal below threshold
- Useful for cleaning up noisy sounds
- Implemented with `DynamicsCompressorNode` or gain automation

## Filters & EQ

**Parametric EQ**
- Multiple frequency bands with adjustable Q
- Uses multiple `BiquadFilterNode` (peaking filters)
- Shape tone with precision

**Formant Filter**
- Multiple resonant peaks for vocal-like sounds
- Combines several bandpass filters
- Great for synth leads and basses

## Modulation & Control

**Second LFO**
- Modulate additional parameters independently
- Can modulate other LFOs for complex motion
- Add more movement and evolution

**Step Sequencer**
- Pattern-based note/parameter automation
- Uses scheduled `AudioParam` changes
- Create rhythmic patterns

**Arpeggiator**
- Automatically cycles through held notes
- Uses timing and note scheduling
- Classic synth feature

## Spatial Effects

**Stereo Panner/Width**
- Control stereo positioning
- Uses `StereoPannerNode`
- Add width and movement

**Auto-Pan**
- LFO-controlled stereo movement
- Modulates `StereoPannerNode`
- Creates swirling effects

## Analysis & Visualization

**Oscilloscope**
- Waveform visualization
- Uses `AnalyserNode` in time domain
- Educational and visually engaging
