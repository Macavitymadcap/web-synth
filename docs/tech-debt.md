# Tech Debt

- Review state of components and see if any further ones can be abstracted out
- Reorganise ui to be less bulky and allow for the possibility of multiple instruments;
  - Create an instrument stack that contains master controls and preset selection for a given synth and contains a voice module and rack of effects
  - Separate out the info popovers into docs site (see below) and make each module a popover triggered by a button in an instrument's effects rack
- Create accompanying docs site that breaks down how to use the synth and how it was built. There should be a chapter/page/section on each module, broken down into:
  - Overview of what the given module is, it's context, history etc.
  - How to use the front end implementation, what settings mean, tips on achieving certain tones/effects etc
  - Code overview, explaining what parts of the web audio/midi api were used, how it is configured, usage etc.