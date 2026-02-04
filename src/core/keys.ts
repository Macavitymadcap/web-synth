
/* ---------- keyboard layout (7 whites per octave) ---------- */
/* bottom (C4) white keys assigned to: z x c v b n m  (C D E F G A B) */
const bottomWhiteKeysComputer = ["z", "x", "c", "v", "b", "n", "m"];
/* bottom black keys on home row aligned above gaps: s d  - g h j  (C# D#  - F# G# A#) */
const bottomBlackKeysComputer: Array<string | null> = ["s", "d", null, "g", "h", "j", null];

/* top (C5) white keys assigned to: q w e r t y u  (C D E F G A B) */
const topWhiteKeysComputer = ["q", "w", "e", "r", "t", "y", "u"];
/* top black keys on number row: 2 3  - 5 6 7  (C# D#  - F# G# A#) */
const topBlackKeysComputer: Array<string | null> = ["2", "3", null, "5", "6", "7", null];

/* ---------- utility: semitone / freq ---------- */
/* White-key semitone offsets within an octave (relative to C): C=0,D=2,E=4,F=5,G=7,A=9,B=11 */
const whiteOffsets = [0, 2, 4, 5, 7, 9, 11];
/* Black key offsets matching index positions: C#=1,D#=3, (no key)=null, F#=6,G#=8,A#=10, (no key)=null */
const blackOffsets: Array<number | null> = [1, 3, null, 6, 8, 10, null];

/* MIDI-like semitone numbers: C4 = 60, C5 = 72 */
const C4 = 60;
const C5 = C4 + 12;

function freqFromSemitone(semitone: number) {
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

/* note name helper */
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/* ---------- build single source of truth: keyInfo ---------- */
type KeyInfo = { name: string; semitone: number; freq: number };
export const keyInfo: Record<string, KeyInfo> = {};

export function buildKeyInfo(upperOctave: number = 5, lowerOctave: number = 4) {
  // Clear existing mappings
  for (const key in keyInfo) {
    delete keyInfo[key];
  }

  /* bottom whites */
  for (let i = 0; i < 7; i++) {
    const k = bottomWhiteKeysComputer[i];
    const sem = lowerOctave * 12 + whiteOffsets[i];
    keyInfo[k] = { name: noteNames[sem % 12] + lowerOctave, semitone: sem, freq: freqFromSemitone(sem) };
  }
  /* bottom blacks */
  for (let i = 0; i < 7; i++) {
    const k = bottomBlackKeysComputer[i];
    if (!k) continue;
    const off = blackOffsets[i];
    if (off === null) continue;
    const sem = lowerOctave * 12 + off;
    keyInfo[k] = { name: noteNames[sem % 12] + lowerOctave, semitone: sem, freq: freqFromSemitone(sem) };
  }

  /* top whites */
  for (let i = 0; i < 7; i++) {
    const k = topWhiteKeysComputer[i];
    const sem = upperOctave * 12 + whiteOffsets[i];
    keyInfo[k] = { name: noteNames[sem % 12] + upperOctave, semitone: sem, freq: freqFromSemitone(sem) };
  }
  /* top blacks */
  for (let i = 0; i < 7; i++) {
    const k = topBlackKeysComputer[i];
    if (!k) continue;
    const off = blackOffsets[i];
    if (off === null) continue;
    const sem = upperOctave * 12 + off;
    keyInfo[k] = { name: noteNames[sem % 12] + upperOctave, semitone: sem, freq: freqFromSemitone(sem) };
  }
}

// Initialize with default octaves
buildKeyInfo(5, 4);

/* convenience frequency only map */
const keyToFreq: Record<string, number> = {};
for (const k of Object.keys(keyInfo)) keyToFreq[k] = keyInfo[k].freq;
