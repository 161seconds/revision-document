/* Lull: the night, mixed. One canvas for rain, wind and the distant train; three faders and a fade
   that drive both the picture and a Web Audio mix. Sound starts only when Listen is pressed. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reduceMQ.matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const nowS = () => performance.now() / 1000;

  /* ---------- Grain: a small generated noise tile, used by the sky and the panel ---------- */
  (() => {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const g = c.getContext('2d'); const img = g.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) { const v = 96 + Math.random() * 64; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    root.style.setProperty('--grain', `url(${c.toDataURL('image/png')})`);
  })();

  /* ---------- Shared state ---------- */
  const level = { rain: 0.6, wind: 0.35, train: 0.15 };
  const timer = { min: 30 };
  const play = { on: false, startAt: 0, doneAt: -1e9, phase: 'idle' };
  const listeners = new Set();
  const emit = () => listeners.forEach((f) => f());

  /* The distant train keeps one clock, shared by picture and sound */
  const PERIOD = 62, CROSS = 44, OFFSET = 0.3 * CROSS;
  const trainP = (t) => { const k = (t + OFFSET) % PERIOD; return k < CROSS ? k / CROSS : -1; };

  /* The fade: full until 60 percent of the time, then a sine ease to silence */
  const fadeAt = (u) => (u <= 0.6 ? 1 : u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * (u - 0.6) / 0.4)));

  /* ---------- Faders ---------- */
  const setLevel = (name, v, fromDrag) => {
    v = clamp(v, 0, 1); level[name] = v;
    const shown = Math.round(v * 100);
    document.querySelectorAll(`.ch[data-ch="${name}"]`).forEach((ch) => {
      ch.style.setProperty('--level', v.toFixed(4));
      const val = ch.querySelector('[data-value]'); if (val.textContent !== String(shown)) val.textContent = shown;
      const f = ch.querySelector('.ch__fader'); f.setAttribute('aria-valuenow', shown);
    });
    document.querySelectorAll(`[data-level-for="${name}"]`).forEach((el) => { el.textContent = shown; });
    emit();
  };

  document.querySelectorAll('.ch').forEach((ch) => {
    const name = ch.dataset.ch; const fader = ch.querySelector('.ch__fader');
    let grab = 0, id = null;
    const geom = () => { const r = fader.getBoundingClientRect(); const cs = getComputedStyle(fader.closest('.mixer')); const capH = parseFloat(cs.getPropertyValue('--cap-h')) || 28; return { r, capH, travel: r.height - capH }; };
    fader.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const { r, capH, travel } = geom();
      const capC = r.top + capH / 2 + (1 - level[name]) * travel;
      grab = Math.abs(e.clientY - capC) <= capH / 2 + 4 ? e.clientY - capC : 0;
      id = e.pointerId; fader.setPointerCapture(id); fader.focus({ preventScroll: true });
      if (grab === 0) setLevel(name, 1 - (e.clientY - r.top - capH / 2) / travel);
      e.preventDefault();
    });
    fader.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      fader.classList.add('is-drag');
      const { r, capH, travel } = geom();
      setLevel(name, 1 - (e.clientY - grab - r.top - capH / 2) / travel, true);
    });
    const end = (e) => { if (e.pointerId !== id) return; id = null; fader.classList.remove('is-drag'); setLevel(name, Math.round(level[name] * 100) / 100); };
    fader.addEventListener('pointerup', end); fader.addEventListener('pointercancel', end);
    fader.addEventListener('keydown', (e) => {
      const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
      let v = Math.round(level[name] * 100);
      if (step !== undefined) v += step * (e.shiftKey && Math.abs(step) === 1 ? 10 : 1);
      else if (e.key === 'Home') v = 0; else if (e.key === 'End') v = 100; else return;
      e.preventDefault(); setLevel(name, v / 100);
    });
  });

  /* ---------- The fade-out timer ---------- */
  const timerEls = [...document.querySelectorAll('.timer')];
  const fmt = (s) => { s = Math.max(0, Math.ceil(s)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };
  const drawTimer = () => {
    const T = timer.min, xe = (T / 60) * 300, xk = xe * 0.6, dx = xe - xk;
    const line = `M0 8 L${xk.toFixed(2)} 8 C${(xk + 0.37 * dx).toFixed(2)} 8 ${(xk + 0.63 * dx).toFixed(2)} 56 ${xe.toFixed(2)} 56 L300 56`;
    timerEls.forEach((el) => {
      el.style.setProperty('--t', (T / 60).toFixed(4));
      el.querySelector('[data-timer-line]').setAttribute('d', line);
      el.querySelector('[data-timer-area]').setAttribute('d', `${line} L0 56 Z`);
      const s = el.querySelector('[data-timer]');
      s.setAttribute('aria-valuenow', T); s.setAttribute('aria-valuetext', `${T} minute${T === 1 ? '' : 's'}`);
    });
    updateTimerText();
  };
  const updateTimerText = () => {
    let txt = `in ${timer.min} min`;
    if (play.on) txt = `in ${fmt(timer.min * 60 - (engine.ctxTime() - play.startAt))}`;
    else if (play.phase === 'done') txt = 'done';
    timerEls.forEach((el) => { const v = el.querySelector('[data-timer-value]'); if (v.textContent !== txt) v.textContent = txt; });
  };
  const setTimer = (m) => { m = clamp(Math.round(m), 1, 60); if (m === timer.min) return; timer.min = m; drawTimer(); };
  timerEls.forEach((el) => {
    const c = el.querySelector('[data-timer]'); let id = null;
    const at = (x) => { const r = c.getBoundingClientRect(); setTimer(((x - r.left) / r.width) * 60); };
    c.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; c.setPointerCapture(id); c.focus({ preventScroll: true }); at(e.clientX); e.preventDefault(); });
    c.addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; c.classList.add('is-drag'); at(e.clientX); });
    const end = (e) => { if (e.pointerId !== id) return; id = null; c.classList.remove('is-drag'); };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    c.addEventListener('keydown', (e) => {
      const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
      if (step !== undefined) setTimer(timer.min + step); else if (e.key === 'Home') setTimer(1); else if (e.key === 'End') setTimer(60); else return;
      e.preventDefault();
    });
  });

  /* ---------- Sound: generated in the browser, never before Listen ---------- */
  const engine = (() => {
    let ctx = null, master, out, g = {}, shape, pan, nextClack = 0, clackBuf, tickId = 0;
    const MAX = { rain: 0.9, wind: 1.6, train: 1.0 };
    const gainFor = (name) => Math.pow(level[name], 1.6) * MAX[name];

    const loopBuffer = (secs, fill) => {
      const sr = ctx.sampleRate, n = Math.floor(sr * secs), F = Math.floor(sr * 0.5);
      const buf = ctx.createBuffer(2, n, sr);
      for (let c = 0; c < 2; c++) {
        const x = fill(n + F, sr), d = buf.getChannelData(c);
        for (let i = 0; i < n; i++) d[i] = x[i];
        for (let i = 0; i < F; i++) { const w = i / F; d[i] = x[i] * Math.sqrt(w) + x[n + i] * Math.sqrt(1 - w); } // seamless loop
      }
      return buf;
    };
    const pink = (n) => { const o = new Float32Array(n); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        o[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; } return o; };
    const brown = (n) => { const o = new Float32Array(n); let l = 0; for (let i = 0; i < n; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; o[i] = l * 3.5; } return o; };
    const rainFill = (n, sr) => { const o = pink(n); // soft drops on glass, scattered through the hiss
      const drops = Math.floor((n / sr) * 55);
      for (let k = 0; k < drops; k++) { const at = Math.floor(Math.random() * n), len = Math.floor(sr * (0.004 + Math.random() * 0.012)), a = Math.pow(Math.random(), 3) * 0.35; let prev = 0;
        for (let i = 0; i < len && at + i < n; i++) { const w = Math.random() * 2 - 1, hp = w - prev; prev = w; o[at + i] += hp * a * Math.exp(-i / (len * 0.25)); } }
      return o; };
    const loop = (buf, offset) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, offset || 0); return s; };
    const filt = (type, f, q) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q !== undefined) b.Q.value = q; return b; };
    const lfo = (hz, depth, param) => { const o = ctx.createOscillator(), d = ctx.createGain(); o.frequency.value = hz; d.gain.value = depth; o.connect(d).connect(param); o.start(); };

    const build = () => {
      const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'playback' });
      master = ctx.createGain(); master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 2.5; comp.attack.value = 0.05; comp.release.value = 0.4;
      out = ctx.createGain(); out.gain.value = 1;
      master.connect(comp).connect(out).connect(ctx.destination);
      ['rain', 'wind', 'train'].forEach((n) => { g[n] = ctx.createGain(); g[n].gain.value = gainFor(n); g[n].connect(master); });

      // Rain: pink hiss with drops, kept off the low end and the harsh top
      const rainVar = ctx.createGain(); rainVar.gain.value = 0.9; lfo(0.031, 0.1, rainVar.gain);
      loop(loopBuffer(9, rainFill)).connect(filt('highpass', 380, 0.5)).connect(filt('lowpass', 5200, 0.4)).connect(rainVar).connect(g.rain);

      // Wind: brown noise through a wandering band, with slow gusts
      const band = filt('bandpass', 480, 0.75); lfo(0.053, 240, band.frequency); lfo(0.129, 90, band.frequency);
      const gust = ctx.createGain(); gust.gain.value = 0.72; lfo(0.041, 0.26, gust.gain); lfo(0.017, 0.12, gust.gain);
      loop(loopBuffer(11, brown), 0).connect(band).connect(filt('lowpass', 1500, 0.5)).connect(gust).connect(g.wind);

      // The distant train: a low rumble that swells and pans as it crosses, with soft wheel beats
      shape = ctx.createGain(); shape.gain.value = 0.1; pan = ctx.createStereoPanner(); pan.pan.value = -0.7;
      const body = filt('lowshelf', 120); body.gain.value = 6;
      loop(loopBuffer(7, brown), 2).connect(filt('lowpass', 360, 0.6)).connect(body).connect(shape).connect(pan).connect(g.train);
      const sr = ctx.sampleRate, cl = Math.floor(sr * 0.11); clackBuf = ctx.createBuffer(1, cl, sr);
      const cd = clackBuf.getChannelData(0); let lp = 0; for (let i = 0; i < cl; i++) { lp += 0.08 * ((Math.random() * 2 - 1) - lp); cd[i] = lp * 3 * Math.exp(-i / (cl * 0.18)); }
      clackOut = filt('lowpass', 520, 0.7); clackOut.connect(pan);
    };
    let clackOut;
    const clack = (t, a) => { const s = ctx.createBufferSource(), v = ctx.createGain(); s.buffer = clackBuf; v.gain.value = a; s.connect(v).connect(clackOut); s.start(t); };

    const tick = () => {
      if (!ctx || !play.on) return;
      const t = ctx.currentTime;
      ['rain', 'wind', 'train'].forEach((n) => g[n].gain.setTargetAtTime(gainFor(n), t, 0.06));
      const p = trainP(nowS()), env = p < 0 ? 0 : Math.pow(Math.sin(Math.PI * p), 1.4);
      shape.gain.setTargetAtTime(0.1 + 0.9 * env, t, 0.3);
      pan.pan.setTargetAtTime(p < 0 ? -0.7 : -0.75 + 1.5 * p, t, 0.3);
      if (p > 0.04 && p < 0.96) { if (nextClack < t) nextClack = t + 0.05; while (nextClack < t + 0.25) { clack(nextClack, 0.5 * env); clack(nextClack + 0.13, 0.42 * env); nextClack += 1.02 + Math.random() * 0.08; } }
      const el = t - play.startAt, T = timer.min * 60, u = el / T, f = fadeAt(u);
      master.gain.setTargetAtTime(f, t, el < 2 ? 0.7 : 0.35);
      const phase = u >= 1 ? 'done' : u > 0.6 ? 'fading' : 'playing';
      if (phase === 'done') { finish(); return; }
      if (phase !== play.phase) { play.phase = phase; emit(); }
      timerEls.forEach((e) => e.style.setProperty('--p', (el / 3600).toFixed(5)));
      updateTimerText();
    };

    const start = async () => {
      if (!ctx) build();
      await ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      play.on = true; play.startAt = ctx.currentTime; play.phase = 'playing'; nextClack = 0;
      clearInterval(tickId); tickId = setInterval(tick, 100); tick(); emit();
    };
    const stop = (phase) => {
      play.on = false; play.phase = phase || 'idle'; clearInterval(tickId);
      if (ctx) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.setTargetAtTime(0, t, 0.12);
        setTimeout(() => { if (!play.on) ctx.suspend(); }, 900); }
      timerEls.forEach((e) => e.style.setProperty('--p', 0));
      emit(); updateTimerText();
    };
    const finish = () => { play.doneAt = nowS(); stop('done'); setTimeout(() => { if (!play.on && play.phase === 'done') { play.phase = 'idle'; emit(); updateTimerText(); } }, 4200); };
    return { start, stop, ctxTime: () => (ctx ? ctx.currentTime : 0), envelope: () => { if (!play.on || !ctx) return 1; return fadeAt((ctx.currentTime - play.startAt) / (timer.min * 60)); } };
  })();

  /* ---------- Listen buttons and status ---------- */
  const STATUS = { idle: 'Sample mix', playing: 'Playing', fading: 'Fading', done: 'Faded out' };
  const listenBtns = document.querySelectorAll('[data-listen]');
  const mixers = document.querySelectorAll('[data-mixer]');
  const syncUI = () => {
    mixers.forEach((m) => {
      m.classList.toggle('is-playing', play.on);
      const s = m.querySelector('[data-status-text]'); if (s && s.textContent !== STATUS[play.phase]) s.textContent = STATUS[play.phase];
    });
    listenBtns.forEach((b) => { b.setAttribute('aria-pressed', String(play.on)); const l = b.querySelector('[data-listen-label]'); const want = play.on ? 'Stop' : 'Listen'; if (l.textContent !== want) l.textContent = want; });
  };
  listeners.add(syncUI);
  if (window.AudioContext || window.webkitAudioContext) {
    listenBtns.forEach((b) => { b.disabled = false; b.addEventListener('click', () => (play.on ? engine.stop() : engine.start())); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && play.on) engine.stop(); });
  }
  document.querySelectorAll('[data-switch]').forEach((s) => s.addEventListener('click', () => s.setAttribute('aria-checked', String(s.getAttribute('aria-checked') !== 'true'))));

  /* ---------- The night, on one canvas ---------- */
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('[data-night]');
  const land = document.querySelector('.night__land');
  const terrain = document.querySelector('[data-terrain]');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, horizon = 0, drops = null, winds = [], sprite = null, last = 0, raf = 0, visible = true;
    const V = { rain: level.rain, wind: level.wind, train: level.train, env: 1 };
    const DEPTH = [
      { len: 9, speed: 48, alpha: 0.07, width: 0.55 },
      { len: 18, speed: 84, alpha: 0.12, width: 0.75 },
      { len: 32, speed: 138, alpha: 0.2, width: 1.05 },
    ];

    /* oklch to an sRGB string, so the canvas shares the stylesheet's colours */
    const ok = (L, C, h, a = 1) => {
      const r0 = (h * Math.PI) / 180, A = C * Math.cos(r0), B = C * Math.sin(r0);
      const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, q = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
      const f = (x) => { x = clamp(x, 0, 1); return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)); };
      return `rgba(${f(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q)}, ${f(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q)}, ${f(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * q)}, ${a})`;
    };
    /* seeded value noise for the ridges, so the land is the same on every visit */
    const noise = (seed) => { let x = seed >>> 0; const v = Array.from({ length: 512 }, () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296));
      return (t) => { const i = Math.floor(t), fr = t - i, u = fr * fr * (3 - 2 * fr); return v[i & 511] + (v[(i + 1) & 511] - v[i & 511]) * u; }; };
    const fbm = (n, t) => n(t) * 0.6 + n(t * 2.1 + 17) * 0.28 + n(t * 4.3 + 41) * 0.12;
    const TOWN = [{ x: 0.36, rx: 0.3, ry: 84, a: 0.17 }, { x: 0.85, rx: 0.15, ry: 52, a: 0.08 }];

    const glow = (g, cx, cy, rx, ry, a, rgb) => {
      g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      gr.addColorStop(0, `rgba(${rgb}, ${a})`); gr.addColorStop(0.45, `rgba(${rgb}, ${a * 0.38})`); gr.addColorStop(1, `rgba(${rgb}, 0)`);
      g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
    };

    /* The land, drawn once per size: town glow, two misty ridges, a plain graded into the dark */
    const drawTerrain = () => {
      if (!terrain) return;
      terrain.width = Math.round(W * dpr); terrain.height = Math.round(H * dpr);
      const g = terrain.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const hz = horizon, step = 3;
      TOWN.forEach((t) => glow(g, t.x * W, hz, t.rx * W, t.ry, t.a, '255, 176, 104'));
      const ridge = (n, scale, base, amp, top, bottom, rim) => {
        g.beginPath(); g.moveTo(0, hz + 2);
        for (let x = 0; x <= W + step; x += step) g.lineTo(x, hz - base - amp * fbm(n, x / scale));
        g.lineTo(W, hz + 2); g.closePath();
        const gr = g.createLinearGradient(0, hz - base - amp, 0, hz); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
        g.fillStyle = gr; g.fill();
        g.beginPath(); for (let x = 0; x <= W + step; x += step) { const y = hz - base - amp * fbm(n, x / scale); x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = rim; g.lineWidth = 1; g.stroke();
      };
      ridge(noise(11), 320, 4, 58, ok(0.215, 0.034, 250), ok(0.17, 0.03, 252), ok(0.8, 0.03, 245, 0.07));
      TOWN.forEach((t) => glow(g, t.x * W, hz, t.rx * W * 0.8, t.ry * 0.6, t.a * 0.45, '255, 186, 118'));
      ridge(noise(29), 190, 1, 22, ok(0.165, 0.03, 252), ok(0.145, 0.028, 254), ok(0.75, 0.03, 245, 0.05));
      // the plain, graded into the night rather than cut
      const pl = g.createLinearGradient(0, hz, 0, H);
      pl.addColorStop(0, ok(0.15, 0.028, 252)); pl.addColorStop(0.18, ok(0.125, 0.024, 255)); pl.addColorStop(1, ok(0.085, 0.016, 258));
      g.fillStyle = pl; g.fillRect(0, hz, W, H - hz);
      TOWN.forEach((t) => glow(g, t.x * W, hz + 4, t.rx * W * 0.7, 16, t.a * 0.5, '255, 186, 118'));
      const mist = g.createLinearGradient(0, hz - 26, 0, hz + 18);
      mist.addColorStop(0, ok(0.3, 0.035, 245, 0)); mist.addColorStop(0.55, ok(0.3, 0.035, 245, 0.16)); mist.addColorStop(1, ok(0.3, 0.035, 245, 0));
      g.fillStyle = mist; g.fillRect(0, hz - 26, W, 44);
      terrain.parentElement.classList.add('has-terrain');
    };

    /* The train: lit windows, a dark body, their warm reflection on the wet plain */
    const makeSprite = () => {
      const pad = 18, len = 170, w = len + pad * 2, h = pad * 2 + 20, c = document.createElement('canvas');
      c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
      const g = c.getContext('2d'); g.scale(dpr, dpr);
      glow(g, pad + len / 2, pad + 5, len * 0.75, 18, 0.2, '255, 184, 108');
      g.fillStyle = 'rgba(5, 8, 15, 0.8)'; g.fillRect(pad - 2, pad - 1, len + 4, 5);
      const wins = [];
      for (let car = 0; car < 6; car++) for (let k = 0; k < 5; k++) { const n = car * 5 + k; wins.push({ x: pad + car * 29 + k * 5, lit: n % 9 !== 4 && n % 13 !== 7, warm: n % 4 === 1 }); }
      wins.forEach((wn) => { if (!wn.lit) return; const r = g.createLinearGradient(0, pad + 6, 0, pad + 14); r.addColorStop(0, 'rgba(255, 196, 124, 0.16)'); r.addColorStop(1, 'rgba(255, 196, 124, 0)'); g.fillStyle = r; g.fillRect(wn.x - 0.5, pad + 6, 4, 8); });
      g.shadowColor = 'rgba(255, 180, 96, 1)'; g.shadowBlur = 7;
      wins.forEach((wn) => { g.fillStyle = wn.lit ? (wn.warm ? '#ffe9c4' : '#ffcf86') : 'rgba(255, 207, 134, 0.22)'; g.fillRect(wn.x, pad, 3, 2); });
      sprite = { c, w, h, pad, len };
    };

    const seed = () => {
      const n = Math.round(clamp((W * H) / 6500, 70, 300));
      drops = { x: new Float32Array(n), y: new Float32Array(n), r: new Float32Array(n), d: new Uint8Array(n), n };
      for (let i = 0; i < n; i++) { const q = Math.random(); drops.d[i] = q < 0.5 ? 0 : q < 0.82 ? 1 : 2; drops.x[i] = Math.random() * W * 1.2 - W * 0.1; drops.y[i] = Math.random() * H; drops.r[i] = 0.8 + Math.random() * 0.4; }
      const count = W < 640 ? 4 : 7; winds = [];
      for (let i = 0; i < count; i++) {
        winds.push({ y: H * 0.12 + ((horizon - 40 - H * 0.12) * (i + Math.random() * 0.8)) / count, L: W * (0.32 + Math.random() * 0.3), x: Math.random() * W * 1.3 - W * 0.4,
          A: 7 + Math.random() * 15, k: (Math.PI * 2) / (300 + Math.random() * 280), w: 0.18 + Math.random() * 0.22, ph: Math.random() * 6.28, ph2: Math.random() * 6.28, v: 12 + Math.random() * 12, s: 0.6 + Math.random() * 0.4 });
      }
    };

    const resize = () => {
      const r = hero.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; horizon = land.offsetTop;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeSprite(); seed(); drawTerrain();
      if (reduced) drawStill();
    };

    const vis = (v) => Math.sqrt(Math.max(0, v));

    const draw = (t, dt) => {
      ctx.clearRect(0, 0, W, H);
      const env = V.env, rainA = vis(V.rain) * env, windA = vis(V.wind) * env, trainA = vis(V.train) * env;

      // The train, far off on the horizon
      const p = reduced ? 0.5 : trainP(t);
      if (p >= 0 && trainA > 0.002) {
        const x = -sprite.len + p * (W + sprite.len);
        const fade = Math.min(1, p * 12, (1 - p) * 12);
        ctx.globalAlpha = Math.min(1, (0.3 + 0.7 * trainA)) * (trainA > 0 ? 1 : 0) * (0.7 + 0.3 * fade);
        ctx.drawImage(sprite.c, x - sprite.pad, horizon - 4 - sprite.pad, sprite.w, sprite.h);
        ctx.globalAlpha = 1;
      }

      // Wind: long soft lines drifting across
      if (windA > 0.002) {
        ctx.lineCap = 'round';
        for (const l of winds) {
          if (dt) { l.x += l.v * (0.35 + V.wind) * dt; if (l.x > W + 20) { l.x = -l.L - Math.random() * W * 0.3; } }
          const a = 0.15 * windA * l.s, grd = ctx.createLinearGradient(l.x, 0, l.x + l.L, 0);
          grd.addColorStop(0, 'rgba(196, 210, 236, 0)'); grd.addColorStop(0.5, `rgba(196, 210, 236, ${a})`); grd.addColorStop(1, 'rgba(196, 210, 236, 0)');
          ctx.beginPath();
          for (let s = 0; s <= l.L; s += 16) { const x = l.x + s; const y = l.y + l.A * Math.sin(l.k * x + l.w * t + l.ph) + l.A * 0.35 * Math.sin(2.3 * l.k * x - 0.6 * l.w * t + l.ph2); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.strokeStyle = grd; ctx.lineWidth = 6; ctx.globalAlpha = 0.16; ctx.stroke();
          ctx.lineWidth = 1; ctx.globalAlpha = 1; ctx.stroke();
        }
      }

      // Rain: fine slow streaks, leaning with the wind
      const slant = 0.05 + 0.22 * V.wind;
      if (rainA > 0.002) {
        for (let d = 0; d < 3; d++) {
          const D = DEPTH[d], tail = new Path2D(), head = new Path2D(), lit = new Path2D();
          for (let i = 0; i < drops.n; i++) {
            if (drops.d[i] !== d) continue;
            if (dt) { const sp = D.speed * drops.r[i] * dt; drops.y[i] += sp; drops.x[i] += sp * slant;
              if (drops.y[i] - D.len > H) { drops.y[i] = -Math.random() * 60; drops.x[i] = Math.random() * W * 1.3 - W * 0.3; } }
            const x = drops.x[i], y = drops.y[i], len = D.len * drops.r[i], mx = x - slant * len * 0.45, my = y - len * 0.45;
            head.moveTo(x, y); head.lineTo(mx, my);
            const gx = (x - TOWN[0].x * W) / (TOWN[0].rx * W * 0.9), gy = (y - horizon + 40) / 260;
            if (gx * gx + gy * gy < 1) { lit.moveTo(x, y); lit.lineTo(x - slant * len * 0.7, y - len * 0.7); }
            tail.moveTo(mx, my); tail.lineTo(x - slant * len, y - len);
          }
          ctx.lineWidth = D.width;
          ctx.strokeStyle = `rgba(200, 214, 238, ${D.alpha * rainA * 0.45})`; ctx.stroke(tail);
          ctx.strokeStyle = `rgba(206, 220, 242, ${D.alpha * rainA * 1.15})`; ctx.stroke(head);
          ctx.strokeStyle = `rgba(255, 206, 150, ${D.alpha * rainA * 1.3})`; ctx.stroke(lit);
        }
      }
    };

    const ease = (dt) => {
      const k = 1 - Math.exp(-dt * 5);
      V.rain += (level.rain - V.rain) * k; V.wind += (level.wind - V.wind) * k; V.train += (level.train - V.train) * k;
      const envT = play.on ? engine.envelope() : play.phase === 'done' && nowS() - play.doneAt < 3.2 ? 0 : 1;
      V.env += (envT - V.env) * (1 - Math.exp(-dt * (envT > V.env ? 0.9 : 1.6)));
    };

    const frame = (ms) => {
      raf = 0; const t = ms / 1000, dt = last ? Math.min(0.05, t - last) : 0; last = t;
      ease(dt); draw(t, dt);
      if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame);
    };
    const run = () => { if (!raf && visible && !document.hidden && !reduced) { last = 0; raf = requestAnimationFrame(frame); } };
    const drawStill = () => { V.rain = level.rain; V.wind = level.wind; V.train = level.train; V.env = 1; draw(0, 0); };

    // Still frame for reduced motion: settle the rain, then hold
    const stillSeed = () => { for (let i = 0; i < drops.n; i++) drops.y[i] = Math.random() * H; };

    resize();
    if (reduced) { stillSeed(); drawStill(); }
    canvas.classList.add('is-live');
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; run(); }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', run);
    let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    listeners.add(() => { if (reduced) requestAnimationFrame(drawStill); });
    reduceMQ.addEventListener('change', (e) => { reduced = e.matches; if (reduced) { cancelAnimationFrame(raf); raf = 0; drawStill(); } else run(); });
    run();
  }

  /* ---------- The close's train runs only when near ---------- */
  const horizonEl = document.querySelector('[data-horizon]');
  if (horizonEl) new IntersectionObserver((es) => horizonEl.classList.toggle('is-near', es[0].isIntersecting), { rootMargin: '200px 0px' }).observe(horizonEl);

  drawTimer();
  syncUI();
  const ready = () => root.classList.add('is-ready');
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(ready));
})();
