# Possible Expansions

**Question**:
> What other modules could be added to the synthesiser using the web audio api?

Based on your current Web Synth architecture, here are some excellent modules you could add using the Web Audio API:

## Sound Generation & Processing

**Noise Generator**
- White, pink, brown noise sources
- Useful for percussion, wind sounds, and sound design
- Uses `AudioBufferSourceNode` with generated noise buffers

**Wave Shaper / Distortion**
- Adds harmonic distortion and saturation
- Uses `WaveShaperNode` with custom transfer curves
- Great for adding grit and warmth

**Ring Modulator**
- Multiplies two signals for metallic, bell-like tones
- Implemented with `GainNode` and oscillators
- Creates inharmonic, robotic sounds

## Time-Based Effects

**Reverb**
- Adds spatial depth and room ambience
- Uses `ConvolverNode` with impulse responses
- Essential for realistic instrument emulation

**Chorus**
- Thickens sound with multiple detuned copies
- Combines `DelayNode` and `OscillatorNode` (LFO)
- Creates lush, wide stereo sounds

**Phaser**
- Sweeping notch filter effect
- Uses multiple `BiquadFilterNode` (allpass filters)
- Classic analog synth sound

**Flanger**
- Short delay with feedback and modulation
- Similar to chorus but with more dramatic sweeping
- Uses `DelayNode` with LFO modulation

## Dynamics & Amplitude

**Compressor**
- Controls dynamic range
- Uses `DynamicsCompressorNode`
- Makes sounds more consistent and punchy

**Tremolo**
- Amplitude modulation (volume wobble)
- Uses `GainNode` modulated by LFO
- Classic guitar amp effect

**Gate/Noise Gate**
- Cuts signal below threshold
- Useful for cleaning up noisy sounds
- Implemented with `DynamicsCompressorNode` or gain automation

## Filters & EQ

**Multi-Mode Filter**
- Add highpass, bandpass, notch options
- Your current filter only uses lowpass
- Uses `BiquadFilterNode` with different types

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

**Spectrum Analyzer**
- Visual frequency display
- Uses `AnalyserNode`
- Helps users see what they're hearing

**Oscilloscope**
- Waveform visualization
- Uses `AnalyserNode` in time domain
- Educational and visually engaging

## Most Impactful Additions

For your synth, I'd recommend prioritizing:

1. **Reverb** - Essential for realistic sounds
2. **Chorus** - Adds depth and width
3. **Multi-Mode Filter** - Expands sound design options
4. **Wave Shaper** - Adds character and warmth
5. **Compressor** - Professional-sounding output
6. **Spectrum Analyzer** - Visual feedback

These would integrate well with your existing modular architecture and significantly expand the sonic capabilities!