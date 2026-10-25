// Driftsong: one sample song, four bars in D major at 92 bpm, and five sample styles.
// The same data draws the hum trace, the quantised notes, the lane clips and their waveforms,
// and feeds the synthesiser in page.js. build.mjs (scratch) runs this file in Node to write the still markup.
(function (root) {
  const BPM = 92, BEATS = 16, TOP = 73, ROWS = 14;
  const SEC = 60 / BPM;
  // melody: [midi, start beat, length in beats]
  const MEL = [[62, 0, 1], [66, 1, 1], [69, 2, 1.5], [66, 3.5, 0.5], [67, 4, 1], [66, 5, 1], [64, 6, 2], [62, 8, 1], [66, 9, 1], [69, 10, 1], [71, 11, 1], [69, 12, 3], [66, 15, 1]];
  // how far off the hum sat on each note, in semitones (a real hum drifts)
  const DRIFT = [-0.34, 0.22, -0.18, 0.4, -0.28, 0.16, -0.36, 0.3, -0.2, 0.26, -0.3, 0.12, -0.24];
  // D | G | Bm | A
  const BARS = [
    { root: 38, keys: [54, 57, 62], str: [62, 66, 69] },
    { root: 43, keys: [55, 59, 62], str: [62, 67, 71] },
    { root: 47, keys: [54, 59, 62], str: [62, 66, 71] },
    { root: 45, keys: [52, 57, 61], str: [61, 64, 69] },
  ];
  const LANES = [['drums', 'Drums'], ['bass', 'Bass'], ['keys', 'Keys'], ['strings', 'Strings']];

  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const each = (bars, fn) => bars.flatMap((b) => fn(BARS[b], b * 4, b));

  // Five sample styles. Each returns its events and the clip regions they sit in.
  const STYLES = {
    daylight: {
      name: 'Daylight',
      drums: each([1, 2, 3], (_, o) => [[o, 'k'], [o + 1, 's'], [o + 2, 'k'], [o + 3, 's'], ...range(8).map((i) => [o + i / 2, 'h'])]),
      bass: each([0, 1, 2, 3], (c, o) => [[c.root, o, 1.8], [c.root, o + 2, 1.3], [c.root + 7, o + 3.5, 0.45]]),
      keys: each([0, 1, 2, 3], (c, o) => [[c.keys, o, 1.9], [c.keys, o + 2, 1.9]]),
      strings: each([2, 3], (c, o) => [[c.str, o, 4]]),
      clips: { drums: [[4, 16]], bass: [[0, 16]], keys: [[0, 8], [8, 16]], strings: [[8, 16]] },
    },
    campfire: {
      name: 'Campfire',
      drums: each([0, 1, 2, 3], (_, o) => [[o, 'k'], ...range(8).map((i) => [o + i / 2, 'sh'])]),
      bass: each([0, 1, 2, 3], (c, o) => [[c.root, o, 1], [c.root, o + 2, 1]]),
      keys: each([0, 1, 2, 3], (c, o) => range(8).map((i) => [[c.keys[[0, 1, 2, 1, 2, 1, 0, 1][i]] + 12], o + i / 2, 0.7])),
      strings: [],
      clips: { drums: [[0, 16]], bass: [[0, 8], [8, 16]], keys: [[0, 16]], strings: [] },
    },
    late: {
      name: 'Late night',
      drums: each([1, 2, 3], (_, o) => [[o, 'k'], [o + 1, 'r'], [o + 2.5, 'k'], [o + 3, 'r']]),
      bass: each([0, 1, 2, 3], (c, o) => [[c.root, o, 3.8]]),
      keys: each([0, 1, 2, 3], (c, o) => [[[...c.keys, c.keys[2] + 2], o, 3.9]]),
      strings: each([0, 1, 2, 3], (c, o) => [[c.str.map((m) => m - 12), o, 4]]),
      clips: { drums: [[4, 16]], bass: [[0, 16]], keys: [[0, 8], [8, 16]], strings: [[0, 16]] },
    },
    room: {
      name: 'Big room',
      drums: each([0, 1, 2, 3], (_, o) => [...range(4).map((i) => [o + i, 'k']), [o + 1, 's'], [o + 3, 's'], ...range(8).map((i) => [o + i / 2 + 0.25, 'h'])]),
      bass: each([0, 1, 2, 3], (c, o) => range(8).map((i) => [c.root + (i % 2 ? 12 : 0), o + i / 2, 0.42])),
      keys: each([0, 1, 2, 3], (c, o) => range(4).map((i) => [c.keys.map((m) => m + 12), o + i + 0.5, 0.3])),
      strings: each([0, 1, 2, 3], (c, o) => [[c.str, o, 4]]),
      clips: { drums: [[0, 8], [8, 16]], bass: [[0, 16]], keys: [[0, 16]], strings: [[0, 16]] },
    },
    lullaby: {
      name: 'Lullaby',
      drums: [],
      bass: [],
      keys: each([0, 1, 2, 3], (c, o) => range(4).map((i) => [[[c.keys[0], c.keys[1], c.keys[2], c.keys[1]][i] + 12], o + i, 1.6])),
      strings: each([1, 2, 3], (c, o) => [[c.str, o, 4]]),
      clips: { drums: [], bass: [], keys: [[0, 16]], strings: [[4, 16]] },
    },
  };

  // deterministic grain for waveforms
  const hash = (x) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // The hum as sung: scoops into each note, glides between them, vibrato that grows on long notes, a drift off pitch.
  // Returns [beat, pitch] samples; gaps (breaths) come back as null.
  function humCurve(step = 1 / 32, tuned = false) {
    const out = [];
    for (let t = 0; t <= BEATS + 1e-6; t += step) {
      const i = MEL.findIndex(([, s, l]) => t >= s && t < s + l);
      const k = i < 0 ? MEL.length - 1 : i;
      const [m, s, l] = MEL[k];
      if (k === 7 && t - s < 0.06) { out.push(null); continue; } // a breath before the second phrase
      const u = t - s;
      let p = m + (tuned ? 0 : DRIFT[k] * 1.35);
      const prev = MEL[k - 1];
      if (prev && k !== 7) { // glide from the previous note
        const from = prev[0] + (tuned ? 0 : DRIFT[k - 1] * 1.35);
        const g = Math.min(1, u / 0.16);
        p = from + (p - from) * (0.5 - 0.5 * Math.cos(Math.PI * g));
      } else if (u < 0.2) p -= 0.7 * (1 - u / 0.2) ** 2; // scoop into a phrase
      const depth = Math.min(1, Math.max(0, (u - 0.3) / 0.9)) * (l >= 1.5 ? 0.24 : 0.12) * (tuned ? 1 : 0.55);
      p += depth * Math.sin(2 * Math.PI * (u * SEC) * (tuned ? 5.4 : 4.6) + (tuned ? 0 : 0.9 * Math.sin(u * 2.7 + k)));
      if (!tuned) p += 0.05 * Math.sin(t * 2.3) + 0.03 * Math.sin(t * 7.1);
      if (t >= BEATS - 0.08) p -= ((t - (BEATS - 0.08)) / 0.08) * 0.5; // falls away at the end
      out.push([t, p]);
    }
    return out;
  }

  // the trace as an SVG path in a 1600 x 1400 box (16 beats by 14 rows)
  function tracePath() {
    const pts = humCurve(1 / 40);
    let d = '', pen = false;
    for (const q of pts) {
      if (!q) { pen = false; continue; }
      const x = (q[0] * 100).toFixed(1), y = ((TOP - q[1] + 0.5) * 100).toFixed(1);
      d += (pen ? 'L' : 'M') + x + ' ' + y;
      pen = true;
    }
    return d;
  }

  // loudness envelope of one lane over its clip, sampled for the waveform
  const smooth = (x) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
  function envelope(style, lane, t) {
    const ev = style[lane];
    let a = 0;
    if (lane === 'drums') {
      for (const [b, ty] of ev) {
        const u = t - b; if (u < 0 || u > 1) continue;
        const [amp, tau] = { k: [1, 0.2], s: [0.62, 0.12], h: [0.2, 0.04], sh: [0.26, 0.07], r: [0.4, 0.05] }[ty];
        a += amp * Math.exp(-u / tau);
      }
    } else {
      for (const [, s, l] of ev) {
        const u = t - s; if (u < 0 || u > l + 0.4) continue;
        let e;
        if (lane === 'bass') { // a long rounded swell: soft in, held, soft out
          const r = Math.min(0.22, l * 0.3);
          e = 0.78 * smooth(u / r) * (1 - 0.18 * smooth((u - r) / Math.max(0.01, l - 2 * r))) * (1 - smooth((u - (l - r)) / r));
        } else if (lane === 'keys') { // a chord: struck, then decaying
          e = (u < 0.03 ? u / 0.03 : Math.exp(-(u - 0.03) / Math.max(0.45, l * 0.55))) * 0.92;
          if (u > l) e *= Math.exp(-(u - l) / 0.08);
        } else { // strings: one slow crescendo across the whole held passage
          const s0 = ev[0][1], last = ev[ev.length - 1], s1 = last[1] + last[2], v = t - s0;
          e = (0.14 + 0.76 * Math.pow(Math.min(1, v / (s1 - s0)), 1.4)) * smooth(v / 0.6);
          if (t > s1) e *= 1 - smooth((t - s1) / 0.35);
          return Math.min(1, e);
        }
        a = Math.max(a, e) + 0.15 * Math.min(a, e);
      }
    }
    return Math.min(1, a);
  }

  // a waveform inside a clip, in a (beats*100) x 40 box. Drums are sharp transients drawn as strokes;
  // bass, keys and strings are filled envelopes, each with its own honest shape.
  function wavePath(style, lane, s, e) {
    if (lane === 'drums') {
      let d = '';
      for (const [b, ty] of style.drums) {
        if (b < s || b >= e) continue;
        const amp = { k: 15, s: 10.5, h: 3.4, sh: 4.4, r: 6.5 }[ty];
        const x = ((b - s) * 100 + 4).toFixed(1); // one sharp stroke per hit, its height the hit's weight
        d += `M${x} ${(20 - amp).toFixed(1)}V${(20 + amp).toFixed(1)}`;
      }
      return d;
    }
    const step = 1 / 20, top = [], bot = [];
    for (let t = s; t <= e + 1e-6; t += step) {
      const env = envelope(style, lane, t);
      const ripple = lane === 'strings' ? 0.04 * Math.sin(t * 22) : lane === 'keys' ? 0.05 * (hash(t * 41.7) - 0.5) : 0;
      const a = Math.max(0.5, (env + ripple * env) * 15);
      const x = ((t - s) * 100).toFixed(1);
      top.push(x + ' ' + (20 - a).toFixed(1));
      bot.unshift(x + ' ' + (20 + a).toFixed(1));
    }
    return 'M' + top.join('L') + 'L' + bot.join('L') + 'Z';
  }

  // the whole song as one envelope, as bars (for the take at the close), in a 1600 x 80 box
  function mixPath(style) {
    const step = 1 / 8;
    let d = '';
    for (let t = step / 2; t < BEATS; t += step) {
      let a = 0;
      for (const [lane] of LANES) a += envelope(style, lane, t) * { drums: 0.5, bass: 0.6, keys: 0.5, strings: 0.45 }[lane];
      const i = MEL.findIndex(([, s, l]) => t >= s && t < s + l);
      if (i >= 0) a += 0.55 * Math.min(1, (t - MEL[i][1]) / 0.05);
      a = Math.min(1, a / 1.6) * (0.72 + 0.28 * hash(t * 37.9));
      const x = ((t / BEATS) * 1600).toFixed(1), h = Math.max(1.5, a * 36);
      d += `M${x} ${(40 - h).toFixed(1)}V${(40 + h).toFixed(1)}`;
    }
    return d;
  }

  const notesHTML = () => MEL.map(([m, s, l], i) => `<i class="note" style="--s:${s};--l:${l};--n:${TOP - m};--d:${DRIFT[i]}" data-note="${i}"></i>`).join('');

  function lanesHTML(key) {
    const st = STYLES[key];
    return LANES.map(([lane, label]) => {
      const clips = st.clips[lane];
      const inner = clips.length
        ? clips.map(([s, e]) => `<span class="clip" style="--s:${s};--e:${e}" data-s="${s}" data-e="${e}"><svg class="wave" viewBox="0 0 ${(e - s) * 100} 40" preserveAspectRatio="none" aria-hidden="true"><path d="${wavePath(st, lane, s, e)}" vector-effect="non-scaling-stroke"/></svg></span>`).join('')
        : '<span class="track__rest">Resting</span>';
      return `<li class="lane lane--${lane}" data-lane="${lane}"><span class="lane__name">${label}</span><span class="track"><span class="track__rev"><span class="track__in">${inner}</span></span></span></li>`;
    }).join('');
  }

  const api = { BPM, BEATS, TOP, ROWS, SEC, MEL, DRIFT, BARS, LANES, STYLES, humCurve, tracePath, wavePath, mixPath, notesHTML, lanesHTML, envelope };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Arrange = api;
})(typeof window !== 'undefined' ? window : globalThis);
