/* Fieldbook: the farm as a survey map.
 * One canvas, generated on load and on resize: contours traced from noise by marching squares (every fifth heavier),
 * the holding edged in tangerine, hedged fields, the lane, the beck and the gate. A map loupe follows the pointer.
 * The day's entries are pins on their fields; the movement draws itself as a route; one entry opens as a notebook card.
 * The farm, its field names and the contour values are samples. */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  window.__fieldbookMap = true;
  const root = document.documentElement;
  const canvas = hero.querySelector('.hero__canvas');
  const loupe = hero.querySelector('.loupe');
  const region = hero.querySelector('.hero__map');
  const farmEl = hero.querySelector('.farm');
  const textEl = hero.querySelector('.hero__text');
  const entry = hero.querySelector('.hero__entry');
  const pins = [...hero.querySelectorAll('.pin')];
  const routePath = hero.querySelector('.route__line');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const staged = root.classList.contains('stage');

  /* Inks, from the theme tokens */
  const ink = (a) => `oklch(18% 0.006 60 / ${a})`;
  const PAPER = 'oklch(96% 0.011 85)';
  const PAPER2 = 'oklch(99.5% 0.005 85)';
  const CONTOUR = (a) => `oklch(62% 0.07 58 / ${a})`;
  const WATER = (a) => `oklch(60% 0.05 232 / ${a})`;
  const HEDGE = (a) => `oklch(50% 0.1 150 / ${a})`;
  const TANGERINE = (a) => `oklch(70% 0.19 40 / ${a})`;

  /* Seeded noise */
  const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const perlin = (seed) => {
    const r = rng(seed); const perm = new Uint8Array(512); const base = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
    const g = (h, x, y) => { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } };
    const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    return (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y); const X = xi & 255, Y = yi & 255; x -= xi; y -= yi;
      const u = f(x), v = f(y); const a = perm[X] + Y, b = perm[X + 1] + Y;
      const n00 = g(perm[a], x, y), n10 = g(perm[b], x - 1, y), n01 = g(perm[a + 1], x, y - 1), n11 = g(perm[b + 1], x - 1, y - 1);
      const l1 = n00 + u * (n10 - n00), l2 = n01 + u * (n11 - n01); return l1 + v * (l2 - l1);
    };
  };
  const fbm = (n, x, y, oct = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };

  /* The sample farm, in frame units (0 to 1 across, 0 to 1 down; the frame is 5:4) */
  const A = 1.25;
  const V = {
    a: [0.04, 0.1], b: [0.34, 0.04], c: [0.64, 0.07], d: [0.92, 0.14], k: [0.95, 0.4], e: [0.97, 0.56], p: [0.95, 0.74], f: [0.9, 0.92],
    g: [0.6, 0.96], h: [0.37, 0.93], i: [0.1, 0.88], s: [0.03, 0.66], j: [0.02, 0.38],
    m: [0.3, 0.33], l: [0.66, 0.37], q: [0.65, 0.56], r: [0.39, 0.57], t: [0.21, 0.61], u: [0.41, 0.77], w: [0.22, 0.79],
  };
  const FIELDS = [
    { name: 'Hill field', ring: 'abcdklmj', at: [0.6, 0.2], size: 13 },
    { name: 'Top meadow', ring: 'lkeq', at: [0.81, 0.45], size: 13 },
    { name: 'Long acre', ring: 'mlqr', at: [0.5, 0.515], size: 13 },
    { name: 'Home paddock', ring: 'jmrts', at: [0.15, 0.565], size: 12 },
    { name: 'Yard', ring: 'truw', at: [0.25, 0.735], size: 11 },
    { name: 'Low meadow', ring: 'rqepfghu', at: [0.47, 0.875], size: 13 },
    { name: 'Bank field', ring: 'stwuhi', at: [0.15, 0.84], size: 12 },
  ];
  const HOLDING = 'abcdkepfghisj';
  const WALLS = new Set(['a-b', 'b-c', 'c-d', 'd-k']);
  const LANE_EDGE = 'h-u';
  const GATE = { edge: 'j-m', t: 0.68 };
  const LANE = [[0.31, 1.3], [0.35, 1.06], [0.37, 0.93], [0.41, 0.77]];
  const STREAM = [[0.8, 1.35], [0.62, 1.1], [0.42, 1.01], [0.24, 0.985], [0.07, 1.03], [-0.15, 1.1], [-0.45, 1.06]];
  const NEIGHBOURS = [[[0.04, 0.1], [-0.25, 0.04], [-0.6, 0.08]], [[0.92, 0.14], [1.2, 0.05], [1.5, 0.1]], [[0.9, 0.92], [1.25, 1.0], [1.6, 0.96]], [[0.34, 0.04], [0.38, -0.3]], [[0.1, 0.88], [-0.25, 0.9]], [[0.6, 0.96], [0.57, 1.35]], [[0.97, 0.56], [1.4, 0.6]]];
  const BUILDINGS = [[0.28, 0.66, 0.07, 0.034], [0.355, 0.645, 0.034, 0.058], [0.345, 0.725, 0.056, 0.026]];

  /* Geometry helpers */
  const chaikin = (pts, closed, it = 2) => {
    let p = pts;
    for (let n = 0; n < it; n++) {
      const o = []; const L = p.length;
      if (!closed) o.push(p[0]);
      for (let i = 0; i < (closed ? L : L - 1); i++) {
        const a = p[i], b = p[(i + 1) % L];
        o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      if (!closed) o.push(p[L - 1]);
      p = o;
    }
    return p;
  };
  const plen = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };
  const bboxOf = (pts, pad = 4) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return [x0 - pad, y0 - pad, x1 + pad, y1 + pad]; };
  const hits = (b, r) => !(b[2] < r[0] || b[0] > r[2] || b[3] < r[1] || b[1] > r[3]);
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
  const pathOf = (pts, closed) => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); if (closed) p.closePath(); return p; };

  /* Marching squares, segments bucketed by level then chained into polylines */
  const EDGES = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], null, [[0, 2]], [[3, 0]], [[3, 0]], [[0, 2]], null, [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];
  function trace(field, nx, ny, cell, step) {
    const buckets = new Map();
    const pt = (i, j, e, v0, v1, v2, v3, t) => {
      switch (e) {
        case 0: return [(i + (t - v0) / (v1 - v0)) * cell, j * cell];
        case 1: return [(i + 1) * cell, (j + (t - v1) / (v2 - v1)) * cell];
        case 2: return [(i + (t - v3) / (v2 - v3)) * cell, (j + 1) * cell];
        default: return [i * cell, (j + (t - v0) / (v3 - v0)) * cell];
      }
    };
    const key = (i, j, e) => (e === 0 ? (j * nx + i) * 2 : e === 2 ? ((j + 1) * nx + i) * 2 : e === 1 ? (j * nx + i + 1) * 2 + 1 : (j * nx + i) * 2 + 1);
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const v0 = field[j * nx + i], v1 = field[j * nx + i + 1], v2 = field[(j + 1) * nx + i + 1], v3 = field[(j + 1) * nx + i];
      const lo = Math.min(v0, v1, v2, v3), hi = Math.max(v0, v1, v2, v3);
      for (let k = Math.ceil(lo / step); k * step < hi; k++) {
        const t = k * step;
        const code = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
        let segs = EDGES[code];
        if (segs === null) { const c = (v0 + v1 + v2 + v3) / 4 > t; segs = code === 5 ? (c ? [[3, 0], [2, 1]] : [[3, 2], [0, 1]]) : (c ? [[0, 1], [3, 2]] : [[3, 0], [2, 1]]); }
        if (!segs.length) continue;
        let b = buckets.get(k); if (!b) buckets.set(k, (b = { pts: new Map(), adj: new Map(), segs: [] }));
        for (const [ea, eb] of segs) {
          const ka = key(i, j, ea), kb = key(i, j, eb);
          if (!b.pts.has(ka)) b.pts.set(ka, pt(i, j, ea, v0, v1, v2, v3, t));
          if (!b.pts.has(kb)) b.pts.set(kb, pt(i, j, eb, v0, v1, v2, v3, t));
          const s = b.segs.length; b.segs.push([ka, kb]);
          (b.adj.get(ka) || b.adj.set(ka, []).get(ka)).push(s);
          (b.adj.get(kb) || b.adj.set(kb, []).get(kb)).push(s);
        }
      }
    }
    const out = [];
    for (const [k, b] of buckets) {
      const used = new Uint8Array(b.segs.length);
      const walk = (from, s0) => { const keys = []; let cur = from, s = s0; for (;;) { const nxt = b.adj.get(cur).find((x) => !used[x]); if (nxt === undefined) break; used[nxt] = 1; const [a, c] = b.segs[nxt]; cur = a === cur ? c : a; keys.push(cur); } return keys; };
      for (let s = 0; s < b.segs.length; s++) {
        if (used[s]) continue; used[s] = 1;
        const [ka, kb] = b.segs[s];
        const fwd = walk(kb, s), back = walk(ka, s);
        const keys = [...back.reverse(), ka, kb, ...fwd];
        const closed = keys[0] === keys[keys.length - 1];
        const pts = keys.map((q) => b.pts.get(q));
        if (closed) pts.pop();
        if (pts.length < 4) continue;
        out.push({ k, closed, pts });
      }
    }
    return out;
  }

  /* Scene state */
  let W = 0, H = 0, dpr = 1, F = null, S = null, textRight = 0, textBottom = 0, mobile = false;
  const toPx = ([u, v]) => [F.x + u * F.w, F.y + v * F.h];
  const noise = perlin(7);
  const wob = perlin(31);

  function layout() {
    const hr = hero.getBoundingClientRect();
    W = Math.round(hr.width); H = Math.round(hr.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    mobile = W < 960;
    const rr = region.getBoundingClientRect(); const tr = textEl.getBoundingClientRect();
    textRight = tr.right - hr.left; textBottom = tr.bottom - hr.top;
    let ax, ay, aw, ah;
    if (!mobile) { ax = rr.left - hr.left; ay = H * 0.08; aw = W - ax - Math.max(16, (W - 1440) / 2 + 24); ah = H * 0.84; }
    else { const eh = entry.offsetHeight || 150; ax = -W * 0.04; ay = textBottom + 4; aw = W * 1.08; ah = H - ay - eh - 24; }
    let fw = Math.max(120, Math.min(aw, ah * A)); let fh = fw / A;
    F = { x: ax + (aw - fw) / 2, y: ay + (ah - fh) / 2, w: fw, h: fh };
    farmEl.style.setProperty('--fx', `${F.x}px`); farmEl.style.setProperty('--fy', `${F.y}px`);
    farmEl.style.setProperty('--fw', `${F.w}px`); farmEl.style.setProperty('--fh', `${F.h}px`);
  }

  function build() {
    const t0 = performance.now();
    const cell = 5; const nx = Math.ceil(W / cell) + 2, ny = Math.ceil(H / cell) + 2;
    const field = new Float32Array(nx * ny);
    const streamIso = STREAM.map(([u, v]) => [u * A, v]);
    const hx = 0.55 * A;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const X = ((i * cell - F.x) / F.h), Y = (j * cell - F.y) / F.h;
      let d = Infinity; for (let s = 1; s < streamIso.length; s++) d = Math.min(d, segDist(X, Y, streamIso[s - 1][0], streamIso[s - 1][1], streamIso[s][0], streamIso[s][1]));
      const hill = 0.42 * Math.exp(-(((X - hx) ** 2) * 1.1 + ((Y + 0.08) ** 2) * 2.6) / 0.3);
      field[j * nx + i] = -0.95 * Y + 0.2 * X + 0.42 * fbm(noise, X * 1.35 + 11.3, Y * 1.35 + 4.1) + hill - 0.2 * Math.exp(-((d / 0.075) ** 2)) - 0.05 * Math.exp(-((d / 0.25) ** 2));
    }
    const step = Math.max(0.014, 16 / F.h);
    const lines = trace(field, nx, ny, cell, step);
    let kmin = Infinity; for (const l of lines) kmin = Math.min(kmin, l.k);
    const contours = [];
    for (const l of lines) {
      const pts = chaikin(l.pts, l.closed, 2);
      const len = plen(pts); if (len < (l.closed ? 90 : 30)) continue;
      const index = (l.k - kmin) % 5 === 0;
      const chunks = [];
      for (let s = 0; s < pts.length - 1; s += 40) { const part = pts.slice(s, Math.min(pts.length, s + 41)); chunks.push({ b: bboxOf(part), p: pathOf(part) }); }
      if (l.closed) { const part = [pts[pts.length - 1], pts[0]]; chunks.push({ b: bboxOf(part), p: pathOf(part) }); }
      contours.push({ pts, index, len, value: 100 + 5 * (l.k - kmin), chunks });
    }

    /* Farm features in px */
    const P = {}; for (const n in V) P[n] = toPx(V[n]);
    const holding = [...HOLDING].map((n) => P[n]);
    const edgeSeen = new Map();
    for (const fld of FIELDS) { const r = [...fld.ring]; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; const id = a < b ? `${a}-${b}` : `${b}-${a}`; if (!edgeSeen.has(id)) edgeSeen.set(id, [a < b ? a : b, a < b ? b : a]); } }
    const edges = [];
    let seed = 1;
    for (const [id, [a, b]] of edgeSeen) {
      if (id === LANE_EDGE) continue;
      const A0 = P[a], B0 = P[b]; const len = Math.hypot(B0[0] - A0[0], B0[1] - A0[1]); const n = Math.max(2, Math.ceil(len / 12));
      const nxp = -(B0[1] - A0[1]) / len, nyp = (B0[0] - A0[0]) / len; const sd = seed++ * 3.7;
      const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; const o = 2.4 * wob(sd, t * 3.1) * Math.sin(Math.PI * t); pts.push([A0[0] + (B0[0] - A0[0]) * t + nxp * o, A0[1] + (B0[1] - A0[1]) * t + nyp * o]); }
      const wall = WALLS.has(id); const gate = id === GATE.edge ? GATE.t : null;
      edges.push({ id, pts, wall, gate, b: bboxOf(pts, 6), len });
    }
    // Hedge dots, chunked per edge
    const r2 = rng(99);
    for (const e of edges) {
      if (e.wall) continue;
      const dots = new Path2D(); let acc = 0, side = 1;
      for (let i = 1; i < e.pts.length; i++) {
        const [x0, y0] = e.pts[i - 1], [x1, y1] = e.pts[i]; const sl = Math.hypot(x1 - x0, y1 - y0); const ux = (x1 - x0) / sl, uy = (y1 - y0) / sl;
        for (let d = (5.2 - acc); d < sl; d += 5.2) {
          const T = (acc + d); const gt = e.gate != null ? Math.abs((((i - 1) + d / sl) / (e.pts.length - 1)) - e.gate) * e.len : Infinity; if (gt < 12) continue;
          side = -side; const off = side * (1.6 + r2() * 0.8); const rad = 0.85 + r2() * 0.55;
          const x = x0 + ux * d - uy * off, y = y0 + uy * d + ux * off; dots.moveTo(x + rad, y); dots.arc(x, y, rad, 0, Math.PI * 2); void T;
        }
        acc = (acc + sl) % 5.2;
      }
      e.dots = dots;
    }
    const lane = chaikin(LANE.map(toPx), false, 3);
    const stream = chaikin(STREAM.map(toPx), false, 3);
    const neighbours = NEIGHBOURS.map((l) => { const pts = chaikin(l.map(toPx), false, 2); return { pts, b: bboxOf(pts), p: pathOf(pts) }; });
    const buildings = BUILDINGS.map(([u, v, bw, bh]) => { const [cx, cy] = toPx([u, v]); const w = bw * F.w, hgt = bh * F.h; const ang = -0.14; const c = Math.cos(ang), s = Math.sin(ang); const corners = [[-w / 2, -hgt / 2], [w / 2, -hgt / 2], [w / 2, hgt / 2], [-w / 2, hgt / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); return { corners, b: bboxOf(corners) }; });
    // The gate: a gap in the hedge, two posts and a leaf swung open
    const ge = edges.find((e) => e.id === GATE.edge); const ga = P[GATE.edge[0]], gb = P[GATE.edge[2]];
    const gl = Math.hypot(gb[0] - ga[0], gb[1] - ga[1]); const gux = (gb[0] - ga[0]) / gl, guy = (gb[1] - ga[1]) / gl;
    const gc = [ga[0] + (gb[0] - ga[0]) * GATE.t, ga[1] + (gb[1] - ga[1]) * GATE.t];
    const post1 = [gc[0] - gux * 8, gc[1] - guy * 8], post2 = [gc[0] + gux * 8, gc[1] + guy * 8];
    const sw = 0.62; const leaf = [post1[0] + (gux * Math.cos(sw) - guy * Math.sin(sw)) * 15, post1[1] + (guy * Math.cos(sw) + gux * Math.sin(sw)) * 15];
    const gate = { c: gc, post1, post2, leaf, edge: ge };
    // Long acre was rolled this morning: its stripes, run along the field
    const la = [...'mlqr'].map((n) => P[n]); const lb = bboxOf(la, 0);
    const sa = Math.atan2(P.l[1] - P.m[1], P.l[0] - P.m[0]); const sux = Math.cos(sa), suy = Math.sin(sa);
    const stripes = new Path2D(); const diag = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]); const lcx = (lb[0] + lb[2]) / 2, lcy = (lb[1] + lb[3]) / 2;
    for (let o = -diag; o < diag; o += 4.5) { stripes.moveTo(lcx - sux * diag - suy * o, lcy - suy * diag + sux * o); stripes.lineTo(lcx + sux * diag - suy * o, lcy + suy * diag + sux * o); }
    const rolled = { ring: la, b: lb, stripes };
    // Labels for fields
    const labels = FIELDS.map((f) => ({ text: f.name, at: toPx(f.at), size: f.size }));
    // Contour values: on index contours, outside the holding, clear of the text and of each other
    const cLabels = [];
    const dock = mobile ? null : dockRect();
    const holdingPad = holding;
    const pinPx = pins.map((p) => toPx([+p.style.getPropertyValue('--u'), +p.style.getPropertyValue('--v')]));
    for (const c of contours.filter((x) => x.index && x.len > 180).sort((a, b) => b.len - a.len)) {
      if (cLabels.length >= 5) break;
      for (let i = 12; i < c.pts.length - 12; i += 9) {
        const [x, y] = c.pts[i];
        if (x < 40 || y < 40 || x > W - 40 || y > H - 40) continue;
        if (!mobile && x < textRight + 70) continue;
        if (mobile && y < textBottom + 30) continue;
        if (inPoly(x, y, holdingPad)) continue;
        if (holding.some((q, qi) => { const q2 = holding[(qi + 1) % holding.length]; return segDist(x, y, q[0], q[1], q2[0], q2[1]) < 30; })) continue;
        if (dock && x > dock[0] - 40 && x < dock[2] + 40 && y > dock[1] - 30 && y < dock[3] + 30) continue;
        if (pinPx.some(([px, py]) => Math.hypot(px - x, py - y) < 120)) continue;
        if (cLabels.some((l) => Math.hypot(l.x - x, l.y - y) < 240)) continue;
        if (stream.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 30)) continue;
        const a0 = Math.atan2(c.pts[i + 4][1] - c.pts[i - 4][1], c.pts[i + 4][0] - c.pts[i - 4][0]);
        const a1 = Math.atan2(c.pts[i + 10][1] - c.pts[i - 10][1], c.pts[i + 10][0] - c.pts[i - 10][0]);
        if (Math.abs(a0 - a1) > 0.12) continue;
        let ang = a0; if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
        cLabels.push({ x, y, ang, text: String(c.value) }); break;
      }
    }
    // The route, sampled from the drawn path, in px
    const route = [];
    if (routePath && routePath.getTotalLength) { const L = routePath.getTotalLength(); for (let i = 0; i <= 90; i++) { const q = routePath.getPointAtLength((L * i) / 90); route.push([F.x + (q.x / 1250) * F.w, F.y + (q.y / 1000) * F.h]); } }
    S = { rolled, contours, edges, lane, stream, neighbours, buildings, gate, labels, cLabels, holding, route, ms: performance.now() - t0 };
  }

  /* Paper: grain and fibre in one tile, made once */
  const grain = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d');
    const img = x.createImageData(192, 192); const r = rng(5);
    for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = img.data[i + 1] = img.data[i + 2] = v > 0.5 ? 255 : 40; img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 22); }
    x.putImageData(img, 0, 0);
    x.lineWidth = 0.5; for (let i = 0; i < 70; i++) { const px = r() * 192, py = r() * 192, a = r() * Math.PI, l = 4 + r() * 10; x.strokeStyle = `rgba(60,48,30,${0.05 + r() * 0.05})`; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + r() * 2, py + Math.sin(a) * l * 0.5 + r() * 2, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    return c;
  })();

  function setFont(ctx, size, weight = 500, family = '"Red Hat Text"', spacing = '0.06em') { ctx.font = `${weight} ${size}px ${family}, ui-sans-serif, sans-serif`; if ('letterSpacing' in ctx) ctx.letterSpacing = spacing; }

  function paintContours(ctx, rect, scale = 1) {
    ctx.beginPath(); S.holding.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = 'oklch(99.5% 0.005 85 / 0.5)'; ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const pass of [false, true]) {
      ctx.strokeStyle = pass ? CONTOUR(0.62) : CONTOUR(0.34); ctx.lineWidth = (pass ? 1.1 : 0.7) / Math.sqrt(scale);
      for (const c of S.contours) { if (c.index !== pass) continue; for (const ch of c.chunks) if (hits(ch.b, rect)) ctx.stroke(ch.p); }
    }
    setFont(ctx, 10, 500, '"Red Hat Mono"', '0.02em'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const l of S.cLabels) {
      if (l.x < rect[0] - 30 || l.x > rect[2] + 30 || l.y < rect[1] - 30 || l.y > rect[3] + 30) continue;
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.ang);
      const w = ctx.measureText(l.text).width + 8; ctx.fillStyle = PAPER; ctx.fillRect(-w / 2, -5, w, 10);
      ctx.fillStyle = CONTOUR(1); ctx.fillText(l.text, 0, 0.5); ctx.restore();
    }
  }

  function paintFeatures(ctx, rect) {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // The land around: boundaries that run on past the holding
    ctx.strokeStyle = ink(0.2); ctx.lineWidth = 0.8;
    for (const n of S.neighbours) if (hits(n.b, rect)) ctx.stroke(n.p);
    // The holding, edged inside in tangerine as on a title plan
    ctx.save(); ctx.beginPath(); S.holding.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = TANGERINE(0.22); ctx.lineWidth = 12; ctx.stroke(); ctx.restore();
    // Long acre, rolled: faint stripes inside its hedges
    if (hits(S.rolled.b, rect)) { ctx.save(); ctx.beginPath(); S.rolled.ring.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip(); ctx.strokeStyle = HEDGE(0.2); ctx.lineWidth = 0.8; ctx.stroke(S.rolled.stripes); ctx.restore(); }
    // Buildings in the yard, hatched
    for (const bd of S.buildings) {
      if (!hits(bd.b, rect)) continue;
      ctx.save(); ctx.beginPath(); bd.corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.fillStyle = PAPER2; ctx.fill(); ctx.clip();
      ctx.strokeStyle = ink(0.42); ctx.lineWidth = 0.6; ctx.beginPath();
      for (let o = bd.b[0] - 60; o < bd.b[2] + 60; o += 3.2) { ctx.moveTo(o, bd.b[3] + 4); ctx.lineTo(o + (bd.b[3] - bd.b[1]) + 8, bd.b[1] - 4); }
      ctx.stroke(); ctx.restore();
      ctx.beginPath(); bd.corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.strokeStyle = ink(0.75); ctx.lineWidth = 0.9; ctx.stroke();
    }
    // The beck, a soft line
    ctx.strokeStyle = WATER(0.16); ctx.lineWidth = 5; ctx.stroke(pathOf(S.stream));
    ctx.strokeStyle = WATER(0.85); ctx.lineWidth = 1.5; ctx.stroke(pathOf(S.stream));
    // The lane: a double line, paper between
    const lp = pathOf(S.lane);
    ctx.strokeStyle = ink(0.62); ctx.lineWidth = 9; ctx.stroke(lp);
    ctx.strokeStyle = PAPER2; ctx.lineWidth = 7; ctx.stroke(lp);
    // Field boundaries: walls solid, hedges a line with its dots
    for (const e of S.edges) {
      if (!hits(e.b, rect)) continue;
      ctx.strokeStyle = e.wall ? ink(0.72) : ink(0.58); ctx.lineWidth = e.wall ? 1.35 : 0.9;
      if (e.gate != null) {
        const g = S.gate; ctx.beginPath(); ctx.moveTo(e.pts[0][0], e.pts[0][1]);
        let past = false; for (let i = 1; i < e.pts.length; i++) { const t = i / (e.pts.length - 1); if (!past && t >= e.gate) { ctx.lineTo(g.post1[0], g.post1[1]); ctx.moveTo(g.post2[0], g.post2[1]); past = true; } ctx.lineTo(e.pts[i][0], e.pts[i][1]); }
        ctx.stroke();
      } else ctx.stroke(pathOf(e.pts));
      if (e.dots) { ctx.fillStyle = HEDGE(0.9); ctx.fill(e.dots); }
    }
    // The gate
    const g = S.gate;
    ctx.fillStyle = ink(0.9); for (const p of [g.post1, g.post2]) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.9, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = ink(0.9); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(g.post1[0], g.post1[1]); ctx.lineTo(g.leaf[0], g.leaf[1]); ctx.stroke();
    // Lettering: field names spaced like a map's, haloed in paper
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (const l of S.labels) {
      if (l.at[0] < rect[0] - 80 || l.at[0] > rect[2] + 80 || l.at[1] < rect[1] - 20 || l.at[1] > rect[3] + 20) continue;
      setFont(ctx, l.size, 500, '"Red Hat Text"', '0.07em');
      ctx.strokeStyle = PAPER; ctx.lineWidth = 3.5; ctx.strokeText(l.text, l.at[0], l.at[1]);
      ctx.fillStyle = ink(0.72); ctx.fillText(l.text, l.at[0], l.at[1]);
    }
    setFont(ctx, 10.5, 500, '"Red Hat Text"', '0.07em');
    const gx = g.c[0] - 6, gy = g.c[1] - 13; ctx.textAlign = 'right'; ctx.strokeStyle = PAPER; ctx.lineWidth = 3; ctx.strokeText('Gate', gx, gy); ctx.fillStyle = ink(0.6); ctx.fillText('Gate', gx, gy);
    ctx.textAlign = 'center';
  }

  function paintRoute(ctx, upto = 1) {
    if (!S.route.length) return;
    const n = Math.max(2, Math.round(S.route.length * upto));
    ctx.save(); ctx.setLineDash([7, 6]); ctx.strokeStyle = ink(1); ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.stroke(pathOf(S.route.slice(0, n))); ctx.restore();
    if (upto > 0.02) { const [x, y] = S.route[0]; const r = Math.max(2, (6 / 1250) * F.w); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = ink(1); ctx.stroke(); }
  }

  function paintFolds(ctx) {
    const fx = Math.round(mobile ? W * 0.5 : F.x + F.w * 0.5), fy = Math.round(H * 0.5);
    let g = ctx.createLinearGradient(fx - 22, 0, fx + 40, 0);
    g.addColorStop(0, ink(0)); g.addColorStop(0.35, ink(0.012)); g.addColorStop(0.355, 'rgba(255,255,255,0.55)'); g.addColorStop(0.37, ink(0.05)); g.addColorStop(0.5, ink(0.022)); g.addColorStop(1, ink(0));
    ctx.fillStyle = g; ctx.fillRect(fx - 22, 0, 62, H);
    g = ctx.createLinearGradient(0, fy - 18, 0, fy + 34);
    g.addColorStop(0, ink(0)); g.addColorStop(0.34, ink(0.01)); g.addColorStop(0.345, 'rgba(255,255,255,0.5)'); g.addColorStop(0.36, ink(0.04)); g.addColorStop(0.5, ink(0.018)); g.addColorStop(1, ink(0));
    ctx.fillStyle = g; ctx.fillRect(0, fy - 18, W, 52);
  }

  let base = null;
  function render() {
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    // Faint mottling, the paper's own unevenness
    const mc = document.createElement('canvas'); mc.width = Math.ceil(W / 28); mc.height = Math.ceil(H / 28); const mx = mc.getContext('2d'); const mi = mx.createImageData(mc.width, mc.height); const mn = perlin(17);
    for (let j = 0; j < mc.height; j++) for (let i = 0; i < mc.width; i++) { const v = fbm(mn, i * 0.11, j * 0.11, 3); const o = (j * mc.width + i) * 4; mi.data[o] = 120; mi.data[o + 1] = 96; mi.data[o + 2] = 60; mi.data[o + 3] = Math.max(0, v) * 34; }
    mx.putImageData(mi, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(mc, 0, 0, W, H);
    // Contours on their own layer, eased back behind the words
    const lc = document.createElement('canvas'); lc.width = canvas.width; lc.height = canvas.height; const lx = lc.getContext('2d'); lx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lx.fillStyle = 'rgba(0,0,0,0)';
    paintContours(lx, [0, 0, W, H]);
    paintFeatures(lx, [0, 0, W, H]);
    lx.globalCompositeOperation = 'destination-in';
    let g;
    if (!mobile) { g = lx.createLinearGradient(textRight - 140, 0, textRight + 60, 0); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,1)'); }
    else { g = lx.createLinearGradient(0, textBottom - 120, 0, textBottom + 20); g.addColorStop(0, 'rgba(0,0,0,0.26)'); g.addColorStop(1, 'rgba(0,0,0,1)'); }
    lx.fillStyle = g; lx.fillRect(0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(lc, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);
    paintFolds(ctx);
    base = true;
  }

  /* The loupe: a small canvas that moves on transforms and redraws the map beneath it, magnified */
  const R = 76, M = 1.9, D = R * 2 + 48;
  const lctx = loupe.getContext('2d');
  let routeT = staged ? 0 : 1;
  const L = { x: 0, y: 0, o: 0 }, T = { x: 0, y: 0, o: 0 };
  let tau = 70, raf = 0, last = 0, inView = true, parkable = false, following = false;
  function sizeLoupe() { loupe.width = D * dpr; loupe.height = D * dpr; loupe.style.width = loupe.style.height = `${D}px`; }
  function park() { if (!S) return; T.x = S.gate.c[0] + 8; T.y = S.gate.c[1] - 22; }
  function drawLoupe() {
    const c = lctx; const cx = L.x, cy = L.y; const h = D / 2;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, D, D);
    // Shadow from the one light, above
    c.save(); c.shadowColor = ink(0.28); c.shadowBlur = 22; c.shadowOffsetY = 9; c.beginPath(); c.arc(h, h, R + 3, 0, Math.PI * 2); c.fillStyle = PAPER2; c.fill(); c.restore();
    c.save(); c.beginPath(); c.arc(h, h, R, 0, Math.PI * 2); c.clip();
    c.setTransform(dpr * M, 0, 0, dpr * M, dpr * (h - M * cx), dpr * (h - M * cy));
    const r = R / M; const rect = [cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4];
    c.fillStyle = PAPER; c.fillRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]);
    paintContours(c, rect, M); paintFeatures(c, rect); paintRoute(c, routeT);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Glass: a falloff at the rim and a highlight from the top
    let g = c.createRadialGradient(h, h, R * 0.7, h, h, R); g.addColorStop(0, ink(0)); g.addColorStop(1, ink(0.1)); c.fillStyle = g; c.fillRect(0, 0, D, D);
    g = c.createLinearGradient(0, h - R, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(h, h - R * 0.42, R * 0.78, R * 0.5, 0, Math.PI, Math.PI * 2); c.fill();
    c.restore();
    // The ring and its reticle
    c.lineWidth = 1; c.strokeStyle = ink(0.85); c.beginPath(); c.arc(h, h, R + 0.5, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 3; c.strokeStyle = PAPER2; c.beginPath(); c.arc(h, h, R + 2.5, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.75; c.strokeStyle = ink(0.35); c.beginPath(); c.arc(h, h, R + 4.4, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1; c.strokeStyle = ink(0.7); c.beginPath();
    for (let q = 0; q < 4; q++) { const a = (q * Math.PI) / 2; c.moveTo(h + Math.cos(a) * (R - 1), h + Math.sin(a) * (R - 1)); c.lineTo(h + Math.cos(a) * (R - 8), h + Math.sin(a) * (R - 8)); }
    c.moveTo(h - 7, h); c.lineTo(h - 2.5, h); c.moveTo(h + 2.5, h); c.lineTo(h + 7, h); c.moveTo(h, h - 7); c.lineTo(h, h - 2.5); c.moveTo(h, h + 2.5); c.lineTo(h, h + 7);
    c.stroke();
    loupe.style.transform = `translate3d(${(cx - h).toFixed(2)}px, ${(cy - h).toFixed(2)}px, 0)`;
    loupe.style.opacity = L.o.toFixed(3);
  }
  function tick(now) {
    const dt = Math.min(48, last ? now - last : 16); last = now;
    if (reduce) { L.x = T.x; L.y = T.y; L.o = T.o; }
    else { const k = 1 - Math.exp(-dt / tau), ko = 1 - Math.exp(-dt / 140); L.x += (T.x - L.x) * k; L.y += (T.y - L.y) * k; L.o += (T.o - L.o) * ko; }
    drawLoupe();
    const settled = Math.abs(T.x - L.x) < 0.05 && Math.abs(T.y - L.y) < 0.05 && Math.abs(T.o - L.o) < 0.004 && !routing;
    if (settled) { L.x = T.x; L.y = T.y; L.o = T.o; drawLoupe(); raf = 0; last = 0; return; }
    raf = requestAnimationFrame(tick);
  }
  const wake = () => { if (!raf && inView && S && parkable) raf = requestAnimationFrame(tick); };

  let routing = false;
  function playRoute(ms) {
    routing = true; const t0 = performance.now(); const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const step = (now) => { const t = Math.min(1, (now - t0) / ms); routeT = ease(t); if (t < 1) requestAnimationFrame(step); else { routing = false; } };
    requestAnimationFrame(step); wake();
  }

  if (fine && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !S || mobile || !parkable) return;
      const hr = hero.getBoundingClientRect(); const x = e.clientX - hr.left, y = e.clientY - hr.top;
      const over = e.target === canvas && x > textRight + 24;
      if (over) { T.x = x; T.y = y; T.o = 1; tau = following ? 60 : 110; following = true; canvas.style.cursor = 'none'; }
      else if (following) { following = false; tau = 260; park(); canvas.style.cursor = ''; }
      wake();
    });
    hero.addEventListener('pointerleave', () => { if (!following) return; following = false; tau = 260; park(); canvas.style.cursor = ''; wake(); });
  }

  /* Entries: pins open the notebook card; the card steps through the day */
  const ORDER = ['fld', 'med', 'mov'];
  const pages = [...entry.querySelectorAll('.entry__page')];
  const states = [...entry.querySelectorAll('.entry__state [data-entry]')];
  const prev = entry.querySelector('.entry__step--prev'), next = entry.querySelector('.entry__step--next');
  let current = 'mov';
  function dockRect() {
    const cw = entry.offsetWidth, ch = entry.offsetHeight;
    const edge = Math.max(0, (W - 1440) / 2) + (parseFloat(getComputedStyle(root).getPropertyValue('--gutter')) || 64);
    const x = Math.min(W - edge - cw, F.x + F.w * 0.6), y = Math.min(H - 28 - ch, F.y + F.h * 0.5);
    return [x, y, x + cw, y + ch];
  }
  function place() {
    if (mobile || !F) return;
    const [x, y] = dockRect();
    entry.style.setProperty('--ex', `${Math.round(x)}px`); entry.style.setProperty('--ey', `${Math.round(y)}px`);
  }
  function open(key) {
    current = key;
    pins.forEach((p) => { const on = p.dataset.entry === key; p.classList.toggle('is-on', on); p.setAttribute('aria-pressed', String(on)); });
    pages.forEach((p) => { p.hidden = p.dataset.entry !== key; });
    states.forEach((s) => { s.hidden = s.dataset.entry !== key; });
    const i = ORDER.indexOf(key); prev.disabled = i <= 0; next.disabled = i >= ORDER.length - 1;
    place();
  }
  pins.forEach((p) => p.addEventListener('click', () => open(p.dataset.entry)));
  prev.addEventListener('click', () => { const i = ORDER.indexOf(current); if (i > 0) open(ORDER[i - 1]); if (prev.disabled) next.focus(); });
  next.addEventListener('click', () => { const i = ORDER.indexOf(current); if (i < ORDER.length - 1) open(ORDER[i + 1]); if (next.disabled) prev.focus(); });

  /* Off screen, nothing runs */
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (!inView && raf) { cancelAnimationFrame(raf); raf = 0; last = 0; } else if (inView) wake(); }).observe(hero);

  /* Re-survey on resize, in the same frame, so the map never stretches */
  let lastW = 0, lastH = 0, started = false;
  const resurvey = () => {
    const r = hero.getBoundingClientRect(); const w = Math.round(r.width), h = Math.round(r.height);
    if (!started || (w === lastW && Math.abs(h - lastH) < 2)) return;
    lastW = w; lastH = h;
    entry.style.transition = 'none';
    layout(); build(); render(); sizeLoupe(); place();
    void entry.offsetWidth; requestAnimationFrame(() => { entry.style.transition = ''; });
    if (parkable && !following) { park(); L.x = T.x; L.y = T.y; }
    if (mobile || !fine) { T.o = 0; L.o = 0; loupe.style.opacity = '0'; } else if (parkable) T.o = 1;
    wake();
  };
  new ResizeObserver(resurvey).observe(hero);

  /* The story, once: the map settles, the pins land in the order of the day, the movement draws, the card opens */
  const fonts = document.fonts ? Promise.race([Promise.all(['500 12px "Red Hat Text"', '500 10px "Red Hat Mono"', '600 20px "Red Hat Display"'].map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve();
  fonts.then(() => {
    started = true; { const r = hero.getBoundingClientRect(); lastW = Math.round(r.width); lastH = Math.round(r.height); }
    layout(); build(); render(); sizeLoupe(); open('mov');
    window.__fieldbookMs = S.ms;
    requestAnimationFrame(() => hero.classList.add('is-ready', 'is-placed'));
    const showLoupe = () => { parkable = true; if (mobile || !fine) return; park(); L.x = T.x; L.y = T.y; T.o = 1; if (reduce) L.o = 1; wake(); };
    if (!staged) { routeT = 1; showLoupe(); return; }
    const byTime = ORDER.map((k) => pins.find((p) => p.dataset.entry === k));
    byTime.forEach((p, i) => setTimeout(() => p.classList.add('is-in'), 380 + i * 170));
    setTimeout(() => { hero.classList.add('is-routed'); playRoute(1100); }, 980);
    setTimeout(() => entry.classList.add('is-open'), 1900);
    setTimeout(showLoupe, 2350);
  });

  /* The inspection record settles in when it comes into view */
  const doc = document.querySelector('.doc');
  if (doc && staged) {
    const r0 = doc.getBoundingClientRect();
    if (r0.top > innerHeight) {
      doc.classList.add('is-folded');
      new IntersectionObserver(([e], o) => { if (e.isIntersecting) { doc.classList.remove('is-folded'); o.disconnect(); } }, { threshold: 0.4 }).observe(doc);
    }
  }

  /* The close: a fragment of the same map under the offer, one hedge, one gate, the pin for the first entry */
  const band = document.querySelector('.band'); const bc = band && band.querySelector('.band__map'); const bpin = band && band.querySelector('.band__pin .pin__dot');
  function renderBand() {
    if (!bc) return; const t0 = performance.now();
    const br = band.getBoundingClientRect(); const bw = Math.round(br.width), bh = Math.round(br.height);
    bc.width = bw * dpr; bc.height = bh * dpr; const c = bc.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, bw, bh);
    const cell = 6; const nx = Math.ceil(bw / cell) + 2, ny = Math.ceil(bh / cell) + 2; const fld = new Float32Array(nx * ny); const n2 = perlin(41);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const X = (i * cell) / 640, Y = (j * cell) / 640; fld[j * nx + i] = -0.5 * Y + 0.35 * X + 0.45 * fbm(n2, X * 1.2 + 3, Y * 1.2 + 9); }
    const step = 12 / 640 * 0.9; const ls = trace(fld, nx, ny, cell, step); let km = Infinity; for (const l of ls) km = Math.min(km, l.k);
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (const l of ls) { const pts = chaikin(l.pts, l.closed, 2); if (plen(pts) < 30) continue; const idx = (l.k - km) % 5 === 0; c.strokeStyle = ink(idx ? 0.2 : 0.11); c.lineWidth = idx ? 1.1 : 0.7; c.stroke(pathOf(pts, l.closed)); }
    if (bpin) {
      const pr = bpin.getBoundingClientRect(); const px = pr.left + pr.width / 2 - br.left, py = pr.top + pr.height / 2 - br.top;
      const ang = 1.2; const ux = Math.cos(ang), uy = Math.sin(ang);
      const a0 = [px - ux * 900, py - uy * 900], a1 = [px + ux * 900, py + uy * 900];
      const g1 = [px - ux * 9, py - uy * 9], g2 = [px + ux * 9, py + uy * 9];
      const hedge = (from, to) => {
        c.strokeStyle = ink(0.42); c.lineWidth = 0.9; c.beginPath(); c.moveTo(...from); c.lineTo(...to); c.stroke();
        const len = Math.hypot(to[0] - from[0], to[1] - from[1]); const dx = (to[0] - from[0]) / len, dy = (to[1] - from[1]) / len; const r3 = rng(3); c.fillStyle = ink(0.34); let sd = 1;
        for (let d = 6; d < len - 6; d += 5.2) { sd = -sd; const o = sd * (1.6 + r3() * 0.8); const rad = 0.85 + r3() * 0.5; c.beginPath(); c.arc(from[0] + dx * d - dy * o, from[1] + dy * d + dx * o, rad, 0, Math.PI * 2); c.fill(); }
      };
      hedge(a0, g1); hedge(g2, a1);
      const b0 = [px + 260, py - 700], b1 = [px + 420, py + 700]; hedge(b0, b1);
      c.fillStyle = ink(0.8); for (const p of [g1, g2]) { c.beginPath(); c.arc(p[0], p[1], 1.9, 0, Math.PI * 2); c.fill(); }
    }
    window.__bandMs = performance.now() - t0;
  }
  if (band) {
    let drawn = false;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !drawn) { drawn = true; renderBand(); } }, { rootMargin: '400px' }).observe(band);
    let bw0 = 0; new ResizeObserver(() => { const w = Math.round(band.getBoundingClientRect().width); if (drawn && w !== bw0) { bw0 = w; renderBand(); } }).observe(band);
  }
})();
