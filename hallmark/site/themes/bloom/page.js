// Driftsong. The hero tells its story once (the hum draws, settles into notes, the band grows in lane by lane),
// then the arrangement really plays: synthesised in the browser, quiet, never on its own.
// Without script, or with reduced motion, every stage is the finished arrangement with the playhead at the start.
(() => {
  const A = window.Arrange;
  const root = document.documentElement;
  const ready = () => root.classList.add('is-ready');
  if (!A) { ready(); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LEN = A.BEATS * A.SEC;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // cubic-bezier easing, solved for x
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 6; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; } return Y(Math.min(1, Math.max(0, t))); };
  };
  const easeOut = bezier(0.16, 1, 0.3, 1), easeIO = bezier(0.65, 0, 0.35, 1), easeHum = bezier(0.42, 0.08, 0.58, 0.96);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}.${Math.floor((s % 1) * 10)}`;

  // ---------- one stage (the hero or the deck) ----------
  const makeStage = (el) => {
    const ph = el.querySelector('[data-ph]');
    const tc = el.querySelector('[data-tc]');
    const btn = el.querySelector('[data-play]');
    let notes = [], clips = [];
    const collect = () => {
      notes = [...el.querySelectorAll('.roll .note, .lane--melody .note')].map((n) => ({ el: n, a: +n.style.getPropertyValue('--s') / 16, b: (+n.style.getPropertyValue('--s') + +n.style.getPropertyValue('--l')) / 16, on: false }));
      clips = [...el.querySelectorAll('.clip[data-s]')].map((c) => ({ el: c, a: +c.dataset.s / 16, b: +c.dataset.e / 16, on: false }));
    };
    collect();
    const setHead = (p) => { ph.style.transform = `translateX(${(p * 100).toFixed(3)}%)`; };
    let lastTc = '';
    const setTime = (s) => { const t = fmt(s); if (t !== lastTc) { tc.textContent = t; lastTc = t; } };
    const light = (p, playing) => {
      for (const set of [notes, clips]) for (const x of set) {
        const on = playing && p >= x.a && p < x.b;
        if (on !== x.on) { x.on = on; x.el.classList.toggle('is-on', on); }
      }
    };
    return { el, ph, btn, setHead, setTime, light, collect };
  };

  const heroEl = document.querySelector('[data-stage="hero"]');
  const deckEl = document.querySelector('[data-stage="deck"]');
  const hero = heroEl && makeStage(heroEl);
  const deck = deckEl && makeStage(deckEl);
  let styleKey = 'daylight';

  // ---------- the synthesiser ----------
  let ctx = null, noiseBuf = null, irBuf = null;
  const ensureBuffers = (c) => {
    const sr = c.sampleRate;
    const nb = c.createBuffer(1, sr, sr), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const len = Math.floor(sr * 2.2), ir = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) { const x = ir.getChannelData(ch); for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * 0.6; }
    return [nb, ir];
  };

  // writes the whole song into a context, starting at t0; returns the master gain
  const schedule = (c, t0, key, buffers) => {
    const [nb, ir] = buffers;
    const st = A.STYLES[key];
    const master = c.createGain(); master.gain.value = 0.62;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2;
    const warm = c.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 7200;
    master.connect(warm).connect(comp).connect(c.destination);
    const verb = c.createConvolver(); verb.buffer = ir; const send = c.createGain(); send.gain.value = 0.22; send.connect(verb).connect(master);
    const bus = (g, wet = 0.6) => { const n = c.createGain(); n.gain.value = g; n.connect(master); if (wet) { const s = c.createGain(); s.gain.value = wet; n.connect(s).connect(send); } return n; };
    const B = (beat) => t0 + beat * A.SEC;

    const tone = (out, t, f, dur, type, gain, atk, rel, opts = {}) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = f; if (opts.detune) o.detune.value = opts.detune;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + atk);
      if (opts.decay) g.gain.setTargetAtTime(gain * (opts.sustain ?? 0.3), t + atk, opts.decay);
      g.gain.setTargetAtTime(0, t + dur, rel);
      let node = o;
      if (opts.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = opts.lp; f2.Q.value = opts.q || 0.5; node = o.connect(f2); }
      node.connect(g).connect(out); o.start(t); o.stop(t + dur + rel * 6);
    };
    const noise = (out, t, dur, gain, type, freq, q = 0.8, atk = 0.001) => {
      const n = c.createBufferSource(); n.buffer = nb;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(f).connect(g).connect(out); n.start(t, Math.random() * 0.5); n.stop(t + dur + 0.05);
    };

    // the hum, tuned: one voice that glides along the curve the trace was drawn from
    const humBus = bus(0.34, 0.5);
    const curve = A.humCurve(1 / 48, true);
    const o1 = c.createOscillator(), o2 = c.createOscillator(), vf = c.createBiquadFilter(), vg = c.createGain();
    o1.type = 'sine'; o2.type = 'sawtooth'; vf.type = 'lowpass'; vf.frequency.value = 900; vf.Q.value = 1.2;
    const g2 = c.createGain(); g2.gain.value = 0.18;
    o1.connect(vg); o2.connect(g2).connect(vf).connect(vg); vg.connect(humBus);
    vg.gain.setValueAtTime(0, t0);
    let lastF = hz(A.MEL[0][0]);
    o1.frequency.setValueAtTime(lastF, t0); o2.frequency.setValueAtTime(lastF, t0);
    for (const q of curve) { if (!q) continue; const f = hz(q[1]), t = B(q[0]); o1.frequency.linearRampToValueAtTime(f, t); o2.frequency.linearRampToValueAtTime(f, t); lastF = f; }
    A.MEL.forEach(([, s, l], i) => {
      const t = B(s), phraseStart = i === 0 || i === 7;
      if (phraseStart) { vg.gain.setTargetAtTime(0.5, t, 0.04); }
      else { vg.gain.setTargetAtTime(0.36, t, 0.015); vg.gain.setTargetAtTime(0.5, t + 0.05, 0.05); }
      if (i === 6 || i === A.MEL.length - 1) vg.gain.setTargetAtTime(0, B(s + l) - 0.08, 0.06);
    });
    o1.start(t0); o2.start(t0); o1.stop(B(16) + 0.6); o2.stop(B(16) + 0.6);

    // keys: a soft electric piano
    const keys = bus(key === 'lullaby' ? 0.42 : 0.3, 0.7);
    for (const [ms, s, l] of st.keys) for (const m of ms) {
      const t = B(s), d = l * A.SEC;
      tone(keys, t, hz(m), d, 'sine', 0.22, 0.006, 0.25, { decay: 0.9, sustain: 0.35 });
      tone(keys, t, hz(m) * 2, d * 0.5, 'sine', 0.05, 0.003, 0.1, { decay: 0.18, sustain: 0.1 });
      tone(keys, t, hz(m), d, 'triangle', 0.05, 0.01, 0.2, { detune: 6, decay: 0.6, sustain: 0.3 });
    }
    // bass: round and low
    const bass = bus(0.5, 0.1);
    for (const [m, s, l] of st.bass) {
      const t = B(s), d = l * A.SEC;
      tone(bass, t, hz(m), d, 'sine', 0.42, 0.008, 0.07, { decay: 0.4, sustain: 0.7 });
      tone(bass, t, hz(m), d, 'sawtooth', 0.08, 0.008, 0.06, { lp: 520, decay: 0.15, sustain: 0.4 });
    }
    // strings: a slow pad
    const strings = bus(0.16, 0.9);
    for (const [ms, s, l] of st.strings) for (const m of ms) for (const det of [-7, 6]) tone(strings, B(s), hz(m), l * A.SEC, 'sawtooth', 0.09, 0.75, 0.7, { detune: det, lp: 1500 });
    // drums: brushed and quiet
    const kit = bus(0.55, 0.25);
    for (const [b, ty] of st.drums) {
      const t = B(b);
      if (ty === 'k') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.16); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.75, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38); o.connect(g).connect(kit); o.start(t); o.stop(t + 0.4); }
      else if (ty === 's') { noise(kit, t, 0.22, 0.16, 'bandpass', 1900, 0.7); tone(kit, t, 190, 0.05, 'triangle', 0.08, 0.002, 0.04); }
      else if (ty === 'h') noise(kit, t, 0.045, 0.045, 'highpass', 7600, 0.7);
      else if (ty === 'sh') noise(kit, t, 0.09, b % 1 ? 0.06 : 0.035, 'bandpass', 5200, 1.2, 0.018);
      else if (ty === 'r') { noise(kit, t, 0.05, 0.1, 'bandpass', 2600, 2); tone(kit, t, 420, 0.03, 'triangle', 0.05, 0.001, 0.02); }
    }
    return master;
  };

  // ---------- playback ----------
  let live = null; // { stage, master, t0, raf }
  const stop = () => {
    if (!live) return;
    const { stage, master } = live;
    cancelAnimationFrame(live.raf);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
    setTimeout(() => master.disconnect(), 400);
    stage.el.classList.remove('is-playing');
    stage.btn.setAttribute('aria-label', stage === hero ? 'Play the arrangement' : 'Play this style');
    stage.light(0, false);
    stage.setTime(0);
    stage.el.classList.add('is-returning');
    stage.setHead(0);
    setTimeout(() => stage.el.classList.remove('is-returning'), 560);
    live = null;
  };
  const play = async (stage, key) => {
    stop();
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); [noiseBuf, irBuf] = ensureBuffers(ctx); }
    if (ctx.state === 'suspended') await ctx.resume();
    if (stage === hero) finishIntro();
    const t0 = ctx.currentTime + 0.06;
    const master = schedule(ctx, t0, key, [noiseBuf, irBuf]);
    stage.el.classList.remove('is-returning');
    stage.el.classList.add('is-playing');
    stage.btn.setAttribute('aria-label', 'Stop');
    live = { stage, master, t0, raf: 0 };
    const frame = () => {
      if (!live || live.stage !== stage) return;
      const s = Math.max(0, ctx.currentTime - t0), p = Math.min(1, s / LEN);
      stage.setHead(p); stage.setTime(s); stage.light(p, true);
      if (p >= 1) { setTimeout(stop, 250); return; }
      live.raf = requestAnimationFrame(frame);
    };
    live.raf = requestAnimationFrame(frame);
  };
  if (hero) hero.btn.addEventListener('click', () => (live && live.stage === hero ? stop() : play(hero, 'daylight')));
  if (deck) deck.btn.addEventListener('click', () => (live && live.stage === deck ? stop() : play(deck, styleKey)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') stop(); });

  // ---------- the hero's story, once ----------
  let finishIntro = () => {};
  if (hero && !reduce) {
    const el = hero.el, heroSec = el.closest('.hero');
    const status = el.querySelector('[data-status-text]');
    const traceOut = el.querySelector('.trace'), traceIn = traceOut.firstElementChild;
    const rail = el.querySelector('[data-rail]'), pen = rail.firstElementChild;
    const notes = [...el.querySelectorAll('.roll .note')];
    const lanes = [...el.querySelectorAll('.lanes .track__rev')].map((r) => [r, r.firstElementChild]);
    const curve = A.humCurve(1 / 64);
    const yAt = (beat) => { let i = Math.min(curve.length - 1, Math.max(0, Math.round(beat * 64))); while (i > 0 && !curve[i]) i--; const q = curve[i] || curve[1]; return (A.TOP - q[1] + 0.5) / A.ROWS; };
    const T = { hum: [300, 3300], snap: 3150, settle: 480, gap: 60, ret: [3500, 4300], lanes: 4000, lane: 1000, stagger: 300 };
    const END = T.lanes + 3 * T.stagger + T.lane + 200;
    const wipe = (pair, p) => { pair[0].style.transform = `translateX(${((p - 1) * 100).toFixed(3)}%)`; pair[1].style.transform = `translateX(${((1 - p) * 100).toFixed(3)}%)`; };
    let said = '';
    const say = (s) => { if (s !== said) { status.textContent = s; said = s; } };

    const render = (t) => {
      // the hum draws
      const ph = clamp01((t - T.hum[0]) / (T.hum[1] - T.hum[0])), p = easeHum(ph);
      wipe([traceOut, traceIn], p);
      const listening = t < T.hum[1];
      heroSec.classList.toggle('is-listening', listening);
      el.classList.toggle('is-listening', listening);
      // the playhead rides the hum, then glides home
      let head = p;
      if (t > T.ret[0]) head = 1 - easeIO(clamp01((t - T.ret[0]) / (T.ret[1] - T.ret[0])));
      hero.setHead(head);
      rail.style.transform = `translateY(${(yAt(p * 16) * 100).toFixed(2)}%)`;
      pen.style.opacity = t < T.hum[0] ? 0 : t < T.hum[1] ? 1 : String(1 - clamp01((t - T.hum[1]) / 300));
      // the notes settle out of the hum onto the grid
      notes.forEach((n, i) => {
        const k = easeOut(clamp01((t - T.snap - i * T.gap) / T.settle));
        n.style.opacity = k.toFixed(3);
        n.style.transform = `translateY(${(-A.DRIFT[i] * 1.35 * 140 * (1 - k)).toFixed(2)}%) scaleX(${(0.92 + 0.08 * k).toFixed(4)})`;
      });
      traceOut.style.opacity = "";
      // the band grows in, part by part
      lanes.forEach((pair, i) => wipe(pair, easeIO(clamp01((t - T.lanes - i * T.stagger) / T.lane))));
      say(t < T.hum[1] ? 'Listening' : t < T.lanes ? 'Finding the notes' : t < END - 200 ? 'Arranging' : 'Arranged');
      hero.setTime(listening ? p * LEN : 0);
    };

    let clock = 0, last = 0, raf = 0, visible = true, done = false, started = false;
    const clear = () => {
      [traceOut, traceIn, rail, pen, ...notes, ...lanes.flat()].forEach((n) => { n.style.transform = ''; n.style.opacity = ''; });
      heroSec.classList.remove('is-listening'); el.classList.remove('is-listening');
      hero.setHead(0); hero.setTime(0); say('Arranged');
    };
    finishIntro = () => { if (done) return; done = true; cancelAnimationFrame(raf); clear(); };
    const tick = (now) => {
      if (done) return;
      clock += Math.min(64, now - last); last = now;
      if (clock >= END) { finishIntro(); return; }
      render(clock);
      if (visible) raf = requestAnimationFrame(tick);
    };
    render(0);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && started && !done) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }, { threshold: 0.15 });
    io.observe(el);
    const go = () => { ready(); setTimeout(() => { started = true; last = performance.now(); if (visible && !done) raf = requestAnimationFrame(tick); }, 250); };
    (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve()).then(() => requestAnimationFrame(go));
  } else {
    (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve()).then(ready);
  }

  // ---------- styles: pull a tape, the band re-arranges ----------
  const spines = [...document.querySelectorAll('[data-style]')];
  const deckLanes = document.querySelector('[data-lanes]');
  const styleName = document.querySelector('[data-style-name]');
  const takeStyle = document.querySelector('[data-take-style]');
  const takeWave = document.querySelector('.take__wave path');
  let growRaf = 0;
  const choose = (key) => {
    if (key === styleKey) return;
    styleKey = key;
    spines.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === key)));
    const name = A.STYLES[key].name;
    styleName.textContent = name;
    if (takeStyle) takeStyle.textContent = name;
    if (takeWave) takeWave.setAttribute('d', A.mixPath(A.STYLES[key]));
    const wasPlaying = live && live.stage === deck;
    deckLanes.innerHTML = A.lanesHTML(key);
    deck.collect();
    if (!reduce) {
      cancelAnimationFrame(growRaf);
      const pairs = [...deckLanes.querySelectorAll('.track__rev')].map((r) => [r, r.firstElementChild]);
      const wipe = (pair, p) => { pair[0].style.transform = `translateX(${((p - 1) * 100).toFixed(3)}%)`; pair[1].style.transform = `translateX(${((1 - p) * 100).toFixed(3)}%)`; };
      pairs.forEach((pr) => wipe(pr, 0));
      const t0 = performance.now();
      const step = (now) => {
        const t = now - t0; let busy = false;
        pairs.forEach((pr, i) => { const k = clamp01((t - i * 90) / 620); if (k < 1) busy = true; wipe(pr, easeIO(k)); });
        if (busy) growRaf = requestAnimationFrame(step); else pairs.forEach((pr) => { pr[0].style.transform = ''; pr[1].style.transform = ''; });
      };
      growRaf = requestAnimationFrame(step);
    }
    if (wasPlaying) play(deck, key);
  };
  spines.forEach((b) => b.addEventListener('click', () => choose(b.dataset.style)));

  // ---------- the close ----------
  const get = document.querySelector('[data-get]'), help = document.getElementById('start-help');
  if (get) get.addEventListener('click', () => { help.textContent = 'Nothing opens yet: the link to the app is not connected.'; });

  // download the sample: rendered offline by the same synthesiser, written as a 16-bit WAV
  const dl = document.querySelector('[data-download]'), note = document.querySelector('[data-dl-note]');
  const wav = (buf) => {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, bytes = 44 + n * ch * 2, v = new DataView(new ArrayBuffer(bytes));
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, bytes - 8, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * ch * 2, true);
    const data = [...Array(ch)].map((_, i) => buf.getChannelData(i));
    let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, data[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
    return new Blob([v], { type: 'audio/wav' });
  };
  if (dl) dl.addEventListener('click', async () => {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Off) { note.textContent = 'This browser cannot render audio offline.'; return; }
    dl.disabled = true; note.textContent = 'Rendering the sample…';
    const sr = 44100, off = new Off(2, Math.ceil(sr * (LEN + 1.8)), sr);
    schedule(off, 0.05, styleKey, ensureBuffers(off));
    const buf = await off.startRendering();
    const name = `kitchen-tune-${A.STYLES[styleKey].name.toLowerCase().replace(/\s+/g, '-')}.wav`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(wav(buf)); a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    dl.disabled = false; note.textContent = `Saved ${name}, made in your browser.`;
  });
})();
