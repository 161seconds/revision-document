/* Relay: the wire, in ASCII. One field on one canvas, snapped to an 8 x 16 character cell.
   Left of the gate the field is raw (an ASCII ramp), right of it typed (braille). Packets run the lanes,
   resolve into their event name at the gate, and one in five fails, waits on a closing gap and retries. */
(() => {
  'use strict';
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const tok = (n, f) => css.getPropertyValue(n).trim() || f;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const CW = 8, CH = 16;
  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  const RAMP = [' ', '·', ':', '-', '=', '+', '*', '#', '%', '@'];
  const BRAILLE = [' ', '⠁', '⠃', '⠇', '⡇', '⣇', '⣧', '⣷', '⣿', '⣿'];
  const CONTOUR = ['─', '╲', '│', '╱'];
  const SCRAMBLE = '#%*+=?/\\<>{}[]:;';

  /* Gradient noise, seeded so every visit draws the same weather */
  const P = new Uint8Array(512);
  { const p = Array.from({ length: 256 }, (_, i) => i); let s = 1042; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; } for (let i = 0; i < 512; i++) P[i] = p[i & 255]; }
  const GX = [1, -1, 1, -1, 1, -1, 0, 0], GY = [1, 1, -1, -1, 0, 0, 1, -1];
  function noise(x, y) {
    const X = Math.floor(x), Y = Math.floor(y), xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const aa = P[P[xi] + yi] & 7, ab = P[P[xi] + yi + 1] & 7, ba = P[P[xi + 1] + yi] & 7, bb = P[P[xi + 1] + yi + 1] & 7;
    const n00 = GX[aa] * xf + GY[aa] * yf, n10 = GX[ba] * (xf - 1) + GY[ba] * yf;
    const n01 = GX[ab] * xf + GY[ab] * (yf - 1), n11 = GX[bb] * (xf - 1) + GY[bb] * (yf - 1);
    const a = n00 + u * (n10 - n00), b = n01 + u * (n11 - n01);
    return a + v * (b - a);
  }
  const fieldAt = (px, py, t) => 0.5 + 0.62 * noise(px / 300 + t * 0.022, py / 230 - t * 0.009) + 0.3 * noise(px / 105 - t * 0.05, py / 90 + t * 0.017);

  /* A glyph atlas: every field glyph in every tint, drawn once at device resolution */
  function atlas(glyphs, tints, dpr, weight) {
    const c = document.createElement('canvas');
    c.width = glyphs.length * CW * dpr; c.height = tints.length * CH * dpr;
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.font = `${weight || 400} 13.333px ${MONO}`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    tints.forEach((tint, r) => { x.fillStyle = tint; glyphs.forEach((g, i) => x.fillText(g, i * CW + CW / 2, r * CH + CH / 2 + 1)); });
    return c;
  }

  const EVENTS = [
    { name: 'invoice.paid', raw: '{"type":"invoice.paid","id":"evt_1042","amount":4800}' },
    { name: 'order.shipped', raw: '{"type":"order.shipped","id":"evt_1043"}' },
    { name: 'customer.updated', raw: '{"type":"customer.updated","source":"crm"}' },
    { name: 'order.created', raw: '{"type":"order.created","id":"evt_1039"}' },
    { name: 'refund.issued', raw: '{"type":"refund.issued","currency":"GBP"}' },
    { name: 'form.submitted', raw: '{"type":"form.submitted","id":"evt_1031"}' },
    { name: 'contact.merged', raw: '{"type":"contact.merged","id":"evt_1036"}' },
  ];

  /* ---------- The hero field ---------- */
  function heroField() {
    const hero = document.querySelector('.hero');
    const cv = hero && hero.querySelector('.field');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const text = hero.querySelector('.hero__text');
    const legend = hero.querySelector('.legend');
    const C = {
      paper: tok('--color-paper', '#f8fafc'), ink: tok('--color-ink', '#141a2a'), ink2: tok('--color-ink-2', '#3a4252'),
      accent: tok('--color-accent', '#2457d6'), deep: tok('--color-accent-deep', '#1d3fa8'), error: tok('--color-error', '#c0392b'),
      g1: tok('--color-glyph-1'), g2: tok('--color-glyph-2'), g3: tok('--color-glyph-3'), g4: tok('--color-glyph-4'),
    };
    const GLYPHS = [...RAMP.slice(1), ...BRAILLE.slice(1, 9), '┊', '┼', '┬', '┴'];
    const TINTS = [C.g1, C.g2, C.g3, C.g4, C.accent, C.deep];
    const gi = (g) => GLYPHS.indexOf(g);
    const RAMP_I = RAMP.map((g) => (g === ' ' ? -1 : gi(g)));
    const BR_I = BRAILLE.map((g) => (g === ' ' ? -1 : gi(g)));
    const GATE_I = gi('┊'), CROSS_I = gi('┼'), CAP_T = gi('┬'), CAP_B = gi('┴');
    /* density level to tint: pale paper-blue at a band's edge, deep cobalt in its core */
    const TINT_OF = [0, 0, 0, 1, 1, 2, 3, 4, 4, 5];

    let W = 0, H = 0, cols = 0, rows = 0, dpr = 1, sheet = null, wide = true;
    let CALM = new Float32Array(0), QUIET = new Float32Array(0), YC = new Float32Array(0), SG = new Float32Array(0), AM = new Float32Array(0);
    let gate = 0, nb = 0, yLeft = [], yGate = [], laneRow = [], gTop = 0, gBot = 0;
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, k: 0, tk: 0 };
    let packets = [], spawned = 0, last = 0, clock = 0, running = false, visible = true, raf = 0;
    const laneNext = [], flash = [];

    function layout() {
      const r = hero.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      wide = W >= 900;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);
      sheet = atlas(GLYPHS, TINTS, dpr);
      /* the calm patch hugs every line of text, so the head always sits on quiet paper */
      const boxes = [];
      let tb = 0;
      [...text.children].forEach((el) => {
        let list = [el.getBoundingClientRect()];
        if (/^(H1|P)$/.test(el.tagName)) { const rg = document.createRange(); rg.selectNodeContents(el); list = [...rg.getClientRects()]; }
        list.forEach((rc) => { if (!rc.width) return; boxes.push({ l: rc.left - r.left - 20, rt: rc.right - r.left + 28, tp: rc.top - r.top - 12, b: rc.bottom - r.top + 12 }); tb = Math.max(tb, rc.bottom - r.top); });
      });
      const lg = legend && legend.offsetParent ? legend.getBoundingClientRect() : null;
      if (lg) boxes.push({ l: lg.left - r.left - 12, rt: lg.right - r.left + 12, tp: lg.top - r.top - 12, b: lg.bottom - r.top + 12 });
      CALM = new Float32Array(cols * rows); QUIET = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const px = x * CW + CW / 2, py = y * CH + CH / 2;
        let m = 0, q = 0;
        for (const bx of boxes) { const d = Math.hypot(Math.max(bx.l - px, 0, px - bx.rt), Math.max(bx.tp - py, 0, py - bx.b)); const k = d <= 0 ? 1 : Math.max(0, 1 - d / 64); if (k > m) m = k; const kq = d <= 0 ? 1 : Math.max(0, 1 - d / 20); if (kq > q) q = kq; }
        CALM[y * cols + x] = m * m * (3 - 2 * m); QUIET[y * cols + x] = q;
      }
      /* the gate sits on the content grid: the left edge of the legend, which spans columns 8 to 12 */
      gate = Math.round((wide && lg ? lg.left - r.left : W * 0.3) / CW);
      /* bands: spread across the field on the left, a sorted bundle at the gate and on the right */
      nb = wide ? (H > 760 ? 6 : 5) : 4;
      const top = wide ? H * 0.1 : tb + 40, bottom = wide ? H * 0.9 : H - 24;
      const spacing = (wide ? (H >= 820 ? 5 : 4) : 3) * CH;
      const mid = wide ? H * 0.47 : (top + bottom) / 2;
      yLeft = []; yGate = []; laneRow = [];
      for (let i = 0; i < nb; i++) {
        yLeft.push(top + ((bottom - top) * (i + 0.5)) / nb);
        const row = Math.round((mid + (i - (nb - 1) / 2) * spacing) / CH - 0.5);
        laneRow.push(row); yGate.push(row * CH + CH / 2);
      }
      gTop = laneRow[0] - 2; gBot = laneRow[nb - 1] + 2;
      YC = new Float32Array(nb * cols); SG = new Float32Array(nb * cols); AM = new Float32Array(nb * cols);
      seed();
    }

    /* the shape of every band for this frame, one column at a time */
    function bands(t) {
      const k = pointer.k, mx = pointer.x, my = pointer.y, R = 200;
      for (let i = 0; i < nb; i++) for (let c = 0; c < cols; c++) {
        const px = c * CW + CW / 2, j = i * cols + c;
        let yc, sg, am;
        if (c < gate) {
          let s = Math.max(0, Math.min(1, (px - gate * CW * 0.3) / (gate * CW * 0.62))); s = s * s * (3 - 2 * s);
          const wave = noise((px - t * 26) / 260, i * 3.7 + 0.5) * 120 * (1 - s);
          yc = yLeft[i] + (yGate[i] - yLeft[i]) * s + wave;
          sg = (1 - s) * (26 + 20 * (0.5 + noise((px - t * 40) / 180, i * 5.1 + 9))) + s * 9;
          am = Math.min(1, 0.5 + 0.75 * (0.5 + noise((px - t * 48) / 150, i * 7.3 + 3)));
          am = am * (1 - s * 0.25) + s * 0.25;
        } else {
          yc = yGate[i]; sg = 7;
          am = 0.4 + 0.12 * Math.sin((px - t * 70) / 46 + i);
        }
        if (k > 0.01) { const dx = px - mx, dy = yc - my, d = Math.hypot(dx, dy); if (d < R) { const f = (1 - d / R) ** 2 * k; yc += (dy >= 0 ? 1 : -1) * f * 46; am = Math.min(1, am * (1 + f * 0.7)); } }
        YC[j] = yc; SG[j] = sg; AM[j] = am;
      }
    }
    const rowAt = (i, c) => Math.round(YC[i * cols + Math.max(0, Math.min(cols - 1, c))] / CH - 0.5);

    /* the opening frame, and the still for reduced motion: raw on the left, one mid-gate, typed on the right, one waiting on a retry */
    function seed() {
      packets = []; spawned = 0;
      const span = cols - gate;
      const plan = [
        { lane: 0, ev: 1, x: cols * 0.18 }, { lane: 0, ev: 6, x: gate + span * 0.42 },
        { lane: 1, ev: 3, x: gate + span * 0.08 },
        { lane: 2, ev: 2, x: gate - 14 },
        { lane: 3, ev: 0, x: gate + span * 0.3, fail: true, state: 'wait', w: 0.35 },
        { lane: 4, ev: 4, x: gate - 34 }, { lane: 4, ev: 5, x: gate + span * 0.5 },
        { lane: nb - 1, ev: 6, x: cols * 0.1 },
      ];
      plan.forEach((p) => { if (p.lane < nb) packets.push(make(p.lane, EVENTS[p.ev], p.x, p)); });
      for (let i = 0; i < nb; i++) laneNext[i] = clock + 1.2 + i * 1.1;
    }

    function make(lane, ev, x, o) {
      const label = ' ' + ev.name + ' ';
      const raw = '{"type":"' + ev.name + '"}';
      const len = raw.length, ls = raw.indexOf(ev.name) - 1;
      const cross = new Float32Array(len).fill(NaN);
      for (let i = 0; i < len; i++) if (Math.floor(x) + i >= gate) cross[i] = -10;
      spawned++;
      return { lane, ev, label, raw, len, ls, x, speed: 8 + ((spawned * 3) % 5), cross, fail: !!(o && o.fail), state: (o && o.state) || 'run', since: clock - ((o && o.w) || 0) * 2.6, stopAt: 0, tried: (o && o.state === 'wait') ? 1 : 0, alpha: 1 };
    }

    function spawn(now) {
      for (let i = 0; i < nb; i++) {
        if (now < (laneNext[i] || 0)) continue;
        if (packets.some((p) => p.lane === i && p.x < 8)) { laneNext[i] = now + 0.6; continue; }
        const failing = !packets.some((p) => p.fail && p.state !== 'deliver' && p.x < cols) && spawned % 3 === 1;
        const ev = failing ? EVENTS[0] : EVENTS[(spawned * 3 + i) % EVENTS.length];
        packets.push(make(i, ev, -ev.name.length - 14, { fail: failing }));
        laneNext[i] = now + 3.4 + ((spawned * 1.7 + i * 0.9) % 4.2);
      }
    }

    const tagOf = (p) => (p.tried && p.state !== 'deliver' ? 4 : 0);
    function step(dt, now) {
      for (const p of packets) {
        if (p.state === 'run') {
          p.x += p.speed * dt;
          if (p.fail && !p.tried && p.x + p.ls >= gate + (cols - gate) * 0.38) { p.state = 'stutter'; p.since = now; p.stopAt = p.x; }
          const tail = p.ls + p.label.length + tagOf(p) + 2;
          if (p.x + tail >= cols - 2 && !Number.isNaN(p.cross[p.ls])) { p.state = 'deliver'; p.since = now; p.x = cols - 2 - tail; }
        } else if (p.state === 'stutter') {
          const e = now - p.since;
          p.x = p.stopAt + (Math.floor(e * 9) % 2 ? -0.6 : 0.4) * (e < 0.7 ? 1 : 0);
          if (e > 0.75) { p.state = 'wait'; p.since = now; p.x = p.stopAt; }
        } else if (p.state === 'wait') {
          if (now - p.since > 2.6) { p.state = 'run'; p.tried = 1; p.speed += 3; }
        } else if (p.state === 'deliver') {
          p.alpha = Math.max(0, 1 - (now - p.since - 0.9) / 0.6);
        }
        for (let i = 0; i < p.len; i++) if (Number.isNaN(p.cross[i]) && Math.floor(p.x) + i >= gate) { p.cross[i] = now; flash[p.lane] = now; }
      }
      packets = packets.filter((p) => p.alpha > 0);
      spawn(now);
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      bands(now);
      const k = pointer.k, mx = pointer.x, my = pointer.y;
      for (let y = 1; y < rows - 1; y++) {
        const py = y * CH, cy = py + CH / 2;
        for (let x = 1; x < cols - 1; x++) {
          const ci = y * cols + x, calm = CALM[ci];
          if (x === gate) {
            if (y >= gTop && y <= gBot) {
              const lane = laneRow.indexOf(y);
              const g = y === gTop ? CAP_T : y === gBot ? CAP_B : lane >= 0 ? CROSS_I : GATE_I;
              ctx.globalAlpha = 1;
              ctx.drawImage(sheet, g * CW * dpr, (lane >= 0 && now - (flash[lane] || -9) < 0.5 ? 4 : 3) * CH * dpr, CW * dpr, CH * dpr, x * CW, py, CW, CH);
            }
            continue;
          }
          let v = 0;
          for (let i = 0; i < nb; i++) {
            const j = i * cols + x, d = cy - YC[j], sg = SG[j];
            if (d > 3 * sg || d < -3 * sg) continue;
            const b = AM[j] * Math.exp(-(d * d) / (2 * sg * sg));
            if (b > v) v = b;
          }
          v *= 1 - calm * 0.93;
          if (v < 0.09) continue;
          const lv = Math.min(9, 1 + Math.floor((v - 0.09) / 0.91 * 9));
          let tint = TINT_OF[lv];
          if (k > 0.01) { const dx = x * CW - mx, dy = py - my, d2 = dx * dx + dy * dy; if (d2 < 16000 * k) tint = Math.min(5, tint + 1); }
          const g = x > gate ? BR_I[lv] : RAMP_I[lv];
          if (g < 0) continue;
          ctx.globalAlpha = (1 - calm * 0.7) * (x < 8 ? (x + 1) / 9 : 1);
          ctx.drawImage(sheet, g * CW * dpr, tint * CH * dpr, CW * dpr, CH * dpr, x * CW, py, CW, CH);
        }
      }
      ctx.globalAlpha = 1;
      ctx.font = `500 13.333px ${MONO}`; ctx.textBaseline = 'middle';
      if (wide) { caption('relay.example.com', gate, gTop - 1, 'center'); caption('example.com/hooks →', cols - 3, gTop - 1, 'right'); }
      else caption('relay', gate, gTop - 1, 'center');
      for (const p of packets) drawPacket(p, now);
    }

    function caption(s, col, row, align) {
      const len = s.length, start = align === 'center' ? col - Math.floor(len / 2) : col - len + 1;
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.paper; ctx.fillRect((start - 1) * CW, row * CH, (len + 2) * CW, CH);
      ctx.fillStyle = C.ink2; ctx.textAlign = 'left';
      for (let i = 0; i < len; i++) ctx.fillText(s[i], (start + i) * CW + 0.5, row * CH + CH / 2 + 1);
    }

    function cellText(ch, col, row, color, alpha) {
      if (col < 0 || col >= cols || alpha <= 0.01) return;
      ctx.globalAlpha = Math.min(1, alpha * 2.5);
      ctx.fillStyle = C.paper; ctx.fillRect(col * CW, row * CH, CW, CH);
      ctx.globalAlpha = alpha;
      if (ch !== ' ') { ctx.fillStyle = color; ctx.fillText(ch, col * CW + 0.5, row * CH + CH / 2 + 1); }
    }

    function drawPacket(p, now) {
      const x0 = Math.floor(p.x), lane = p.lane;
      /* a run keeps one row and one opacity, so a fragment is either whole or fading as a whole */
      const head = Math.max(0, Math.min(cols - 1, x0 + p.len - 1));
      const row = p.state === 'run' && !Number.isNaN(p.cross[p.len - 1]) ? laneRow[lane] : rowAt(lane, head);
      const enter = Math.max(0, Math.min(1, (x0 + p.len) / (p.len + 4))) ** 2;
      let cm = 0; for (let c = Math.max(0, x0 - 2); c < Math.min(cols, x0 + p.len + 2); c++) cm = Math.max(cm, QUIET[row * cols + c]);
      const runA = (1 - cm * 0.9) * enter * p.alpha;
      const fade = (c) => (c >= 0 && c < cols ? runA : 0);
      ctx.textAlign = 'left';
      const rearCrossed = !Number.isNaN(p.cross[0]);
      const first = x0 + (rearCrossed ? p.ls : 0);
      for (let j = 1; j <= 9; j++) {
        const c = first - j; if (c < 0) continue;
        const typedTrail = c >= gate;
        const ch = typedTrail ? (j < 6 ? '─' : '╌') : (j < 3 ? '=' : j < 6 ? '-' : '·');
        cellText(ch, c, row, typedTrail ? C.accent : C.g4, (1 - j / 10) * fade(c));
      }
      const failing = p.state === 'stutter' || p.state === 'wait';
      for (let i = 0; i < p.len; i++) {
        const c = x0 + i; if (c < 0 || c >= cols) continue;
        let ch, color, wt = 500;
        if (Number.isNaN(p.cross[i])) { ch = p.raw[i]; color = C.accent; wt = 400; }
        else if (i < p.ls || i >= p.ls + p.label.length) continue;
        else if (now - p.cross[i] < 0.3) { ch = SCRAMBLE[(Math.floor(now * 30) + i * 3) % SCRAMBLE.length]; color = C.accent; }
        else { ch = p.label[i - p.ls]; color = failing ? C.error : p.tried && p.state !== 'deliver' ? C.accent : C.ink; }
        ctx.font = `${wt} 13.333px ${MONO}`;
        cellText(ch, c, row, color, fade(c));
      }
      ctx.font = `500 13.333px ${MONO}`;
      const end = x0 + p.ls + p.label.length;
      if (p.state === 'stutter') ' 503'.split('').forEach((ch, i) => cellText(ch, end + i, row, C.error, 1));
      else if (p.state === 'wait') {
        /* the gap: the band parts ahead of the failed event and closes as the retry comes due */
        const G = 20, w = Math.round(G * Math.max(0, 1 - (now - p.since) / 2.6));
        ctx.globalAlpha = 1; ctx.fillStyle = C.paper;
        ctx.fillRect(end * CW, (row - 1) * CH, (w + 6) * CW, CH * 3);
        ' 503'.split('').forEach((ch, i) => cellText(ch, end + i, row, C.error, 1));
        for (let i = 0; i < w; i++) cellText('┄', end + 5 + i, row, C.error, 0.55);
        cellText('┤', end + 5 + w, row, C.error, 0.9);
      } else if (p.state === 'deliver') ' ✓'.split('').forEach((ch, i) => cellText(ch, end + i, row, C.accent, p.alpha));
      else if (p.tried) ' ↻ 2'.split('').forEach((ch, i) => cellText(ch, end + i, row, C.accent, 1));
      ctx.globalAlpha = 1;
    }

    function frame(ms) {
      raf = 0;
      if (!running) return;
      const now = ms / 1000;
      const dt = Math.min(0.1, now - (last || now));
      if (dt >= 1 / 32 || !last) {
        last = now; clock += dt;
        pointer.k += (pointer.tk - pointer.k) * 0.12;
        pointer.x += (pointer.tx - pointer.x) * 0.18; pointer.y += (pointer.ty - pointer.y) * 0.18;
        step(dt, clock);
        draw(clock);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce.matches || !visible) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function still() { stop(); clock = 37; seed(); packets.forEach((p) => { for (let i = 0; i < p.len; i++) if (!Number.isNaN(p.cross[i])) p.cross[i] = -10; }); const failed = packets.find((p) => p.fail); if (failed) failed.since = clock - 1.1; draw(clock); }

    function boot() {
      clock = 37;
      layout();
      root.classList.add('has-field');
      if (reduce.matches) still(); else { draw(clock); start(); }
    }
    hero.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top; pointer.tk = 1;
      if (pointer.x < -1000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.tk = 0; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); }).observe(hero);
    reduce.addEventListener('change', () => (reduce.matches ? still() : start()));
    let rz = 0;
    new ResizeObserver(() => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { layout(); if (reduce.matches || !running) still(); }); }).observe(hero);
    const fonts = document.fonts ? Promise.race([document.fonts.load(`400 13.333px ${MONO}`, '┊⣿').then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    fonts.then(boot);
  }

  /* ---------- A still field for the replay panel, in graphite ---------- */
  function stillField(cv, opts) {
    const box = cv.parentElement.getBoundingClientRect();
    if (!box.width) return false;
    const W = Math.round(box.width), H = Math.round(box.height), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `400 13.333px ${MONO}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    const cols = Math.ceil(W / CW), rows = Math.ceil(H / CH);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const px = x * CW, py = y * CH;
      const fade = opts.fade ? opts.fade(px / W, py / H) : 1;
      const v = fieldAt(px * 1.1 + 400, py * 1.1 + 200, opts.t || 12) * fade;
      const lv = Math.max(0, Math.min(9, Math.floor(Math.pow(Math.max(0, (v - 0.42) / 0.58), 1.1) * 10)));
      if (!lv) continue;
      ctx.fillStyle = lv < 4 ? opts.c1 : lv < 7 ? opts.c2 : opts.c3;
      ctx.fillText((opts.glyphs || RAMP)[lv], px + CW / 2, py + CH / 2 + 1);
    }
    return true;
  }

  function replay() {
    const rp = document.querySelector('[data-replay]');
    if (!rp) return;
    const cv = rp.querySelector('.rp__field');
    const paint = () => stillField(cv, { c1: tok('--color-graphite-glyph-1'), c2: tok('--color-graphite-glyph-2'), c3: tok('--color-graphite-glyph-3'), glyphs: BRAILLE, fade: (u, v) => 0.55 + 0.6 * u * (0.4 + 0.6 * v), t: 21 });
    new ResizeObserver(() => paint()).observe(rp);
    const go = rp.querySelector('[data-replay-go]'), log = rp.querySelector('.rp__log');
    const ms = [164, 201, 176, 188, 159];
    let n = 0;
    go.addEventListener('click', () => {
      if (go.getAttribute('aria-busy') === 'true') return;
      go.setAttribute('aria-busy', 'true');
      const d = new Date(), p2 = (v) => String(v).padStart(2, '0');
      const li = document.createElement('li');
      li.className = 'rp__line is-new';
      li.innerHTML = `<code>${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}</code><span>Replaying <code>evt_1042</code></span><code class="wait">sent</code><code></code>`;
      log.prepend(li);
      while (log.children.length > 3) log.lastElementChild.remove();
      setTimeout(() => { li.querySelector('span').innerHTML = 'Replayed <code>evt_1042</code>'; const c = li.querySelectorAll('code'); c[2].className = 'ok'; c[2].textContent = '200 OK'; c[3].textContent = ms[n++ % ms.length] + ' ms'; go.removeAttribute('aria-busy'); }, reduce.matches ? 0 : 700);
    });
  }

  /* ---------- Copyable curl chips ---------- */
  function copies() {
    document.querySelectorAll('[data-copy]').forEach((chip) => {
      const b = chip.querySelector('.curl__copy'), say = chip.querySelector('.curl__say');
      if (!b) return;
      let t = 0;
      b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(chip.dataset.copy); say.textContent = 'Copied'; } catch { const r = document.createRange(); r.selectNodeContents(chip.querySelector('.curl__cmd')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); say.textContent = 'Selected'; }
        chip.classList.add('is-done'); clearTimeout(t);
        t = setTimeout(() => { say.textContent = 'Copy'; chip.classList.remove('is-done'); }, 1800);
      });
    });
  }

  /* ---------- The event inspector: matched lines joined by thin connectors ---------- */
  function inspector() {
    document.querySelectorAll('[data-insp]').forEach((fig) => {
      const panes = fig.querySelector('.insp__panes'), svg = fig.querySelector('.insp__wires');
      const [left, right] = fig.querySelectorAll('.insp__pane');
      const keys = [...left.querySelectorAll('[data-k]')].map((e) => e.dataset.k);
      let drawn = false;
      const draw = () => {
        const b = panes.getBoundingClientRect();
        if (!b.width) return;
        const gl = left.getBoundingClientRect().right - b.left, gr = right.getBoundingClientRect().left - b.left;
        const mid0 = Math.round((gl + gr) / 2), step = Math.min(12, (gr - gl - 48) / (keys.length * 2));
        svg.replaceChildren();
        keys.forEach((k, n) => {
          const a = left.querySelector(`[data-k="${k}"]`).getBoundingClientRect(), z = right.querySelector(`[data-k="${k}"]`).getBoundingClientRect();
          const x1 = Math.round(a.right - b.left + 12), y1 = Math.round(a.top + a.height / 2 - b.top), x2 = Math.round(z.left - b.left - 12), y2 = Math.round(z.top + z.height / 2 - b.top);
          const mid = Math.round(mid0 + (n - (keys.length - 1) / 2) * step), dy = y2 - y1, r = Math.min(12, Math.abs(dy) / 2);
          const g = document.createElement('i');
          g.className = 'wire-c'; g.dataset.k = k; g.style.setProperty('--n', n); g.style.setProperty('--r', r + 'px');
          const seg = (cls, x, y, w, h) => { const e = document.createElement('i'); e.className = cls; Object.assign(e.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); g.append(e); };
          seg('wire-c__node', x1 - 2, y1 - 2, 5, 5);
          if (Math.abs(dy) < 2) seg('wire-c__h', x1, y1, x2 - x1, 1);
          else {
            const down = dy > 0, top1 = down ? y1 : y1 - Math.abs(dy) / 2, top2 = down ? y1 + dy / 2 : y2;
            seg('wire-c__h', x1, y1, mid - r - x1, 1);
            seg(down ? 'wire-c__e wire-c__e--tr' : 'wire-c__e wire-c__e--br', mid - r, top1, r, Math.abs(dy) / 2);
            seg(down ? 'wire-c__e wire-c__e--bl' : 'wire-c__e wire-c__e--tl', mid - 1, top2, r + 1, Math.abs(dy) / 2 + 1);
            seg('wire-c__h', mid + r, y2, x2 - mid - r, 1);
          }
          seg('wire-c__node', x2 - 2, y2 - 2, 5, 5);
          svg.append(g);
        });
        if (!drawn) { drawn = true; requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('is-wired'))); }
        mark(fig.dataset.on || 'amount');
      };
      const mark = (k) => { fig.dataset.on = k; fig.querySelectorAll('[data-k]').forEach((e) => e.classList.toggle('is-on', e.dataset.k === k)); };
      fig.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-k]'); if (t) mark(t.dataset.k); });
      new ResizeObserver(draw).observe(panes);
      if (document.fonts) document.fonts.ready.then(draw);
    });
  }

  /* ---------- The delivery timeline plays its story once ---------- */
  function timeline() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.4 });
    document.querySelectorAll('[data-tl]').forEach((t) => io.observe(t));
  }

  /* ---------- One row of the field as a divider, and the footer mast drawn in characters ---------- */
  function divider() {
    document.querySelectorAll('canvas.wire__row').forEach((cv) => {
      const W = cv.parentElement.clientWidth, H = CH, dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      const n = Math.ceil(W / CW), gate = Math.floor(n * 0.5);
      const name = ' order.shipped ', raw = '{"type":"order.', r0 = gate - raw.length;
      const tint = [tok('--color-glyph-1'), tok('--color-glyph-2'), tok('--color-glyph-3'), tok('--color-glyph-4')];
      const put = (ch, x, color, weight) => { ctx.font = `${weight || 400} 13.333px ${MONO}`; ctx.fillStyle = color; ctx.fillText(ch, x * CW + CW / 2, CH / 2 + 1); };
      for (let x = 0; x < n; x++) {
        if (x === gate) { put('┊', x, tok('--color-accent')); continue; }
        if (x >= r0 - 7 && x < r0) { put(x < r0 - 3 ? '-' : '=', x, tint[3]); continue; }
        if (x >= r0 && x < gate) { put(raw[x - r0], x, tok('--color-accent')); continue; }
        if (x > gate && x <= gate + name.length) { put(name[x - gate - 1], x, tok('--color-ink'), 500); continue; }
        if (x > gate + name.length && x <= gate + name.length + 8) { put('─', x, tok('--color-accent')); continue; }
        const v = fieldAt(x * CW, 40, 9);
        const lv = Math.max(0, Math.min(9, Math.floor(Math.max(0, (v - 0.26) / 0.74) * 10)));
        if (lv) put(x > gate ? BRAILLE[lv] : RAMP[lv], x, tint[lv < 3 ? 0 : lv < 6 ? 1 : 2]);
      }
    });
  }

  function mast() {
    const cv = document.querySelector('.mast');
    if (!cv) return;
    const paint = () => {
      const box = cv.parentElement.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(cv.parentElement).paddingLeft) || 0;
      const W = Math.round(box.width - pad * 2);
      if (W < 100) return;
      const rows = W < 700 ? 10 : 18, H = rows * CH;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* rasterise the wordmark once, then read it back cell by cell */
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const o = off.getContext('2d');
      o.fillStyle = '#000'; o.textBaseline = 'alphabetic';
      const FAM = '"Familjen Grotesk", system-ui, sans-serif';
      o.font = `600 100px ${FAM}`;
      const mt = o.measureText('Relay');
      const inkH = mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent, inkW = mt.actualBoundingBoxLeft + mt.actualBoundingBoxRight;
      const size = Math.min(((H - CH) / inkH) * 100, ((W * (W < 700 ? 0.98 : 0.72)) / inkW) * 100);
      o.font = `600 ${size}px ${FAM}`;
      try { o.letterSpacing = `${-0.02 * size}px`; } catch {}
      const m2 = o.measureText('Relay');
      o.fillText('Relay', m2.actualBoundingBoxLeft, CH * 0.5 + m2.actualBoundingBoxAscent);
      const wordRight = Math.ceil((m2.actualBoundingBoxLeft + m2.actualBoundingBoxRight) / CW) + 2;
      const baseRow = Math.floor((CH * 0.5 + m2.actualBoundingBoxAscent) / CH);
      const px = o.getImageData(0, 0, W, H).data;
      const ink = tok('--color-ink'), ink2 = tok('--color-ink-2'), accent = tok('--color-accent'), g2 = tok('--color-glyph-2'), g3 = tok('--color-glyph-3');
      ctx.font = `500 13.333px ${MONO}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      const cols = Math.floor(W / CW);
      const lane = Math.min(rows - 1, baseRow);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        let cover = 0;
        for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 2; sx++) { const X = x * CW + 2 + sx * 4, Y = y * CH + 2 + sy * 4; cover += px[(Y * W + X) * 4 + 3] / 255; }
        cover /= 8;
        const v = fieldAt(x * CW, y * CH, 4);
        let g = '', c = g2;
        if (cover > 0.15) {
          g = cover > 0.9 ? RAMP[7 + Math.round(Math.max(0, Math.min(1, v)) * 2)] : cover > 0.55 ? '*' : ':';
          c = cover > 0.9 ? ink : cover > 0.55 ? ink2 : g3;
        } else if (x > wordRight) {
          const ramp = Math.min(1, (x - wordRight) / 14);
          const lv = Math.max(0, Math.min(9, Math.floor(Math.max(0, (v * ramp - 0.42) / 0.58) * 10)));
          if (lv) { g = RAMP[lv]; c = lv > 5 ? g3 : g2; }
        }
        if (y === lane && !g) { g = '╌'; c = g2; }
        if (g) { ctx.fillStyle = c; ctx.fillText(g, x * CW + CW / 2, y * CH + CH / 2 + 1); }
      }
      /* one typed event resting on the baseline lane, past the wordmark */
      const label = ' invoice.paid ✓ ', start = cols - label.length - 2;
      if (start <= wordRight) return;
      ctx.fillStyle = tok('--color-paper'); ctx.fillRect(start * CW, lane * CH, label.length * CW, CH);
      ctx.fillStyle = accent;
      for (let i = 0; i < label.length; i++) ctx.fillText(label[i], (start + i) * CW + CW / 2, lane * CH + CH / 2 + 1);
    };
    const go = () => paint();
    if (document.fonts) document.fonts.load('600 100px "Familjen Grotesk"').then(go, go); else go();
    let t = 0;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(paint, 120); }).observe(cv.parentElement);
  }

  heroField();
  replay();
  copies();
  inspector();
  timeline();
  const fontsReady = document.fonts ? document.fonts.load(`400 13.333px ${MONO}`, '┊⣿') : Promise.resolve();
  fontsReady.then(divider, divider);
  let dz = 0;
  addEventListener('resize', () => { clearTimeout(dz); dz = setTimeout(divider, 150); });
  mast();
})();
