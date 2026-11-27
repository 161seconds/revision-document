/* Swath sample site: a generated construction site scanned as points.
   One data set feeds three views: the hero cloud, the layers cloud and the section cut. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const FIX = new URLSearchParams(location.search).get('t');

  /* ---------- colour: read the theme's OKLCH tokens as linear-ish sRGB ---------- */
  const css = getComputedStyle(root);
  function oklch(str) {
    const m = str.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/);
    if (!m) return [1, 1, 1];
    const L = +m[1] / 100, C = +m[2], h = (+m[3] * Math.PI) / 180;
    const a = C * Math.cos(h), b = C * Math.sin(h);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3, mm = m_ ** 3, s = s_ ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
    ];
    return lin.map((v) => {
      v = Math.max(0, Math.min(1, v));
      return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    });
  }
  const tok = (n) => oklch(css.getPropertyValue(n));
  const COL = { lo: tok('--point-lo'), mid: tok('--point-mid'), hi: tok('--point-hi'), acc: tok('--color-accent'), paper: tok('--color-paper'), muted: tok('--color-muted'), rule: tok('--color-rule-2') };
  const rgb = (c, a = 1) => `rgba(${c.map((v) => Math.round(v * 255)).join(',')},${a})`;

  /* ---------- the site ---------- */
  let seed = 20261020;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const P = new Uint8Array(512); { const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) P[i] = p[i & 255]; }
  const fade = (t) => t * t * (3 - 2 * t);
  const hash = (x, y) => P[(P[x & 255] + y) & 255] / 255;
  function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = fade(xf), v = fade(yf); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1; }
  const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.12;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  const W = 120, D = 90, PAD = 41.25, FLOOR = 3.6;
  const PILE = { x: 80, z: -24, r: 16, h: 8 };
  function ground(x, z) {
    let h = 39.4 + 0.04 * x + 0.025 * z + fbm(x * 0.016 + 3, z * 0.016 - 2) * 8.5 + fbm(x * 0.07, z * 0.07) * 0.7;
    const dx = Math.max(-46 - x, 0, x - 40), dz = Math.max(-34 - z, 0, z - 30);
    h = PAD + (h - PAD) * smooth(0, 11, Math.hypot(dx, dz));
    if (x > 34) { const road = Math.abs(z - (38 + (x - 34) * 0.12)); const lvl = PAD + (x - 34) * 0.045; h = lvl + (h - lvl) * smooth(3.5, 9, road); }
    return h;
  }
  function pile(x, z) { const d = Math.hypot(x - PILE.x, z - PILE.z) / PILE.r; return d < 1 ? PILE.h * Math.pow(1 - d, 1.25) * (1 + 0.06 * vnoise(x * 0.4, z * 0.4)) : 0; }

  // ep: 1 = new in scan 14, -1 = only in scan 13, 0 = in both
  const pos = [], cls = [], rr = [], sh = [], eps = []; let EP = 0;
  const add = (x, y, z, c, h = 0.9, e = EP) => { pos.push(x, y, z); cls.push(c); rr.push(rnd()); sh.push(h); eps.push(e); };
  const small = innerWidth < 700;
    // airborne lidar lands in rows: one row every 0.8 m across the flight line, a point every 0.3 m along it
  const ROW = small ? 1.25 : 0.8, STEP = small ? 0.42 : 0.3;
  const hs = (x, z) => { const e = 0.6, gx = (ground(x + e, z) + pile(x + e, z) - ground(x - e, z) - pile(x - e, z)) / (2 * e), gz = (ground(x, z + e) + pile(x, z + e) - ground(x, z - e) - pile(x, z - e)) / (2 * e); const n = [-gx * 2.2, 1, -gz * 2.2], l = Math.hypot(...n); return Math.max(0, (n[0] * -0.55 + n[1] * 0.62 + n[2] * -0.56) / l); };
  for (let z = -D; z <= D; z += ROW) {
    const bend = Math.sin(z * 0.013) * 1.8;
    for (let x = -W; x <= W; x += STEP * (0.7 + rnd() * 0.6)) {
      const zz = z + bend * (x / W) + (rnd() - 0.5) * 0.18;
      const p = pile(x, zz);
      add(x, ground(x, zz) + p + (rnd() - 0.5) * 0.06, zz, p > 0.35 ? 3 : 0, hs(x, zz), p > 0.35 ? 1 : 0);
      if (p > 0.35) add(x, ground(x, zz) + (rnd() - 0.5) * 0.06, zz, 0, 0.9, -1);
    }
  }
  // building frame on the pad: slabs, columns, a core
  const B = { x0: -36, x1: 6, z0: -24, z1: 12 };
  const slab = (y, x1, n) => { for (let i = 0; i < n; i++) { const x = B.x0 + rnd() * (x1 - B.x0), z = B.z0 + rnd() * (B.z1 - B.z0); add(x, y + rnd() * 0.25, z, 1); } for (let i = 0; i < n * 0.35; i++) { const t = rnd(), side = Math.floor(rnd() * 4); const x = side < 2 ? B.x0 + t * (x1 - B.x0) : side === 2 ? B.x0 : x1; const z = side < 2 ? (side ? B.z1 : B.z0) : B.z0 + t * (B.z1 - B.z0); add(x, y + rnd() * 0.3, z, 1); } };
  slab(PAD + 0.2, B.x1, 2600); slab(PAD + FLOOR, B.x1, 2600); slab(PAD + FLOOR * 2, B.x1, 2400); EP = 1; { const x0 = B.x0; B.x0 = -22; slab(PAD + FLOOR * 3, B.x1, 1500); B.x0 = x0; } EP = 0;
  for (let cx = B.x0; cx <= B.x1 + 0.1; cx += 7) for (let cz = B.z0; cz <= B.z1 + 0.1; cz += 6) {
    const top = cx < -22 ? PAD + FLOOR * 2 : PAD + FLOOR * 3;
    for (let y = PAD; y < top; y += 0.22) add(cx + (rnd() - 0.5) * 0.4, y, cz + (rnd() - 0.5) * 0.4, 1, 0.9, y > PAD + FLOOR * 2 + 0.2 ? 1 : 0);
  }
  const core = { x0: -22, x1: -15, z0: -8, z1: -1, top: PAD + FLOOR * 3 + 2.4 };
  for (let i = 0; i < 4200; i++) { const y = PAD + rnd() * (core.top - PAD), t = rnd(), s = Math.floor(rnd() * 4); const x = s < 2 ? core.x0 + t * (core.x1 - core.x0) : s === 2 ? core.x0 : core.x1; const z = s < 2 ? (s ? core.z1 : core.z0) : core.z0 + t * (core.z1 - core.z0); add(x, y, z, 1); }
  // tower crane: a lattice mast and a jib
  const CR = { x: 16, z: -16, top: PAD + 38 };
  const line = (a, b, step) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const n = Math.ceil(L / step); for (let i = 0; i <= n; i++) { const t = i / n; add(a[0] + (b[0] - a[0]) * t + (rnd() - 0.5) * 0.12, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + (rnd() - 0.5) * 0.12, 1); } };
  const legs = [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]];
  legs.forEach(([lx, lz]) => line([CR.x + lx, PAD, CR.z + lz], [CR.x + lx, CR.top, CR.z + lz], 0.16));
  for (let y = PAD; y < CR.top - 2; y += 2.4) for (let k = 0; k < 4; k++) { const a = legs[k], b = legs[(k + 1) % 4]; line([CR.x + a[0], y, CR.z + a[1]], [CR.x + b[0], y + 2.4, CR.z + b[1]], 0.25); }
  const jy = CR.top, jx0 = CR.x - 14, jx1 = CR.x + 48;
  [[-0.7, 0], [0.7, 0]].forEach(([dz]) => line([jx0, jy, CR.z + dz], [jx1, jy, CR.z + dz], 0.18));
  line([CR.x - 6, jy + 1.6, CR.z], [jx1 - 4, jy + 1.6, CR.z], 0.2);
  for (let x = jx0; x < jx1 - 2; x += 2.2) line([x, jy, CR.z - 0.7], [x + 1.1, jy + 1.6, CR.z], 0.22);
  line([CR.x, jy, CR.z], [CR.x, jy + 7, CR.z], 0.16); line([CR.x, jy + 7, CR.z], [jx1 - 10, jy + 1.6, CR.z], 0.25); line([CR.x, jy + 7, CR.z], [jx0 + 2, jy, CR.z], 0.25);
  line([CR.x + 30, jy, CR.z], [CR.x + 30, PAD + 12, CR.z], 0.2);
  // welfare cabins by the gate
  const box = (x0, y0, z0, w, h, d, n) => { for (let i = 0; i < n; i++) { const f = Math.floor(rnd() * 5), u = rnd(), v = rnd(); let x, y, z; if (f === 0) { x = x0 + u * w; y = y0 + h; z = z0 + v * d; } else if (f < 3) { x = x0 + u * w; y = y0 + v * h; z = f === 1 ? z0 : z0 + d; } else { x = f === 3 ? x0 : x0 + w; y = y0 + v * h; z = z0 + u * d; } add(x, y, z, 1); } };
  for (let k = 0; k < 3; k++) { const gx = 66 + k * 3.2, gz = 46; box(gx, ground(gx, gz), gz, 2.8, 2.6, 9, 420); }
  box(66, ground(66, 46) + 2.6, 46, 2.8, 2.6, 9, 420);
  // canopy: a hedge line of trees on the north and west boundaries
  const trees = [];
  for (let x = -112; x < 116; x += 7 + rnd() * 6) trees.push([x, 80 + rnd() * 7]);
  for (let z = -82; z < 74; z += 8 + rnd() * 7) trees.push([-112 + rnd() * 6, z]);
  for (let k = 0; k < 9; k++) trees.push([98 + rnd() * 18, -86 + k * 7 + rnd() * 3]);
  trees.forEach(([tx, tz]) => { const g = ground(tx, tz), r = 3 + rnd() * 3.2, th = 2.5 + rnd() * 3, cy = g + th + r * 0.85; const n = small ? 150 : 240;
    for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), k = r * (0.72 + 0.34 * rnd()); const y = cy + u * k * 0.82; if (y < g + th * 0.7) continue; add(tx + s * Math.cos(a) * k, y, tz + s * Math.sin(a) * k, 2); }
    for (let y = g; y < g + th + 0.5; y += 0.3) add(tx + (rnd() - 0.5) * 0.3, y, tz + (rnd() - 0.5) * 0.3, 2); });

  const N = cls.length;
  const POS = new Float32Array(pos), CLS = new Float32Array(cls), RND = new Float32Array(rr), SHD = new Float32Array(sh), EPS = new Float32Array(eps);
  window.swathSite = { N, POS, CLS, ground, PAD, FLOOR, PILE };

  /* ---------- matrices ---------- */
  const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]; };
  function lookAt(e, c) { let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2]; let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l; let xx = zz, xy = 0, xz = -zx; l = Math.hypot(xx, xy, xz); xx /= l; xz /= l; const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx; return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]; }
  const mul = (a, b) => { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; };

  const VS = `attribute vec3 p; attribute float c; attribute float r; attribute float sh; attribute float e;
uniform mat4 m; uniform vec2 off; uniform float dpr, size, sweep, alpha, lime, near, far;
uniform vec4 show; uniform vec3 lo, mid, hi, acc; uniform vec2 hr, ext; uniform float ep, diff;
varying vec4 col;
void main(){
  float s = c < .5 ? show.x : c < 1.5 ? show.y : c < 2.5 ? show.z : max(show.x, lime);
  vec4 q = m * vec4(p, 1.); q.xy += off * q.w; gl_Position = q;
  float h = clamp((p.y - hr.x) / (hr.y - hr.x), 0., 1.);
  vec3 k = h < .5 ? mix(lo, mid, h * 2.) : mix(mid, hi, (h - .5) * 2.);
  k *= .56 + .62 * sh;
  float d = sweep - p.x; float w = d >= 0. ? .6 * exp(-d / 2.2) + .4 * exp(-d / 20.) : exp(d / .7);
  k = mix(k, hi * 1.15, min(1., w * 1.1));
  if (c > 2.5) k = mix(k, acc, lime);
  float pop = c > 2.5 ? lime : 0.;
  if (diff > .5 && e > .5) { k = acc; pop = 1.; }
  if ((e > .5 && ep < .5) || (e < -.5 && ep > .5)) s = 0.;
  float fd = clamp(1. - (q.w - near) / (far - near), .3, 1.);
  float edge = smoothstep(1., .74, length(p.xz / ext));
  gl_PointSize = clamp(size * dpr * 260. / q.w * (.8 + .4 * r) * (1. + .35 * w), 1. * dpr, 3.6 * dpr);
  col = vec4(k, s * mix(fd * edge * min(1., .74 + .5 * w), edge, pop) * alpha);
  if (s < .01) gl_Position = vec4(3., 3., 3., 1.);
}`;
  const FS = `precision mediump float; varying vec4 col;
void main(){ vec2 d = gl_PointCoord - .5; float e = dot(d, d); if (e > .25) discard; float a = col.a * smoothstep(.25, .12, e); gl_FragColor = vec4(col.rgb * a, a); }`;

  function Cloud(canvas, o) {
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true, alpha: true, powerPreference: 'high-performance' });
    if (!gl) return null;
    const mk = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
    const pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    const buf = (data, name, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); };
    buf(POS, 'p', 3); buf(CLS, 'c', 1); buf(RND, 'r', 1); buf(SHD, 'sh', 1); buf(EPS, 'e', 1);
    const U = {}; ['m', 'off', 'dpr', 'size', 'sweep', 'alpha', 'lime', 'near', 'far', 'show', 'lo', 'mid', 'hi', 'acc', 'hr', 'ext', 'ep', 'diff'].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    gl.uniform3fv(U.lo, COL.lo); gl.uniform3fv(U.mid, COL.mid); gl.uniform3fv(U.hi, COL.hi); gl.uniform3fv(U.acc, COL.acc);
    gl.uniform2f(U.hr, 35, 56); gl.uniform2f(U.ext, W + 4, D + 4); gl.uniform1f(U.dpr, DPR);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST);
    const st = { show: [1, 1, 1], showT: [1, 1, 1], lime: 1, limeT: 1, alpha: 0, yaw: o.yaw, px: 0, py: 0, tpx: 0, tpy: 0, w: 0, h: 0, mvp: null, off: [0, 0] };
    function resize() { const r = canvas.getBoundingClientRect(); st.w = r.width; st.h = r.height; canvas.width = Math.round(r.width * DPR); canvas.height = Math.round(r.height * DPR); gl.viewport(0, 0, canvas.width, canvas.height); }
    resize();
    function draw(t, dt) {
      const L = (a, b, k) => a + (b - a) * Math.min(1, k * dt);
      for (let i = 0; i < 3; i++) st.show[i] = L(st.show[i], st.showT[i], 6);
      st.lime = L(st.lime, st.limeT, 6);
      st.alpha = L(st.alpha, 1, 2.2);
      st.px = L(st.px, st.tpx, 3); st.py = L(st.py, st.tpy, 3);
      const layout = o.layout(st.w, st.h);
      const yaw = st.yaw + st.px * 0.07, pitch = layout.pitch + st.py * 0.05, R = layout.dist;
      const tg = [layout.tx || 0, 47, layout.tz || 0];
      const eye = [tg[0] + R * Math.cos(pitch) * Math.sin(yaw), tg[1] + R * Math.sin(pitch), tg[2] + R * Math.cos(pitch) * Math.cos(yaw)];
      st.mvp = mul(persp(layout.fov, st.w / st.h, 20, 900), lookAt(eye, tg)); st.off = layout.off;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(U.m, false, st.mvp); gl.uniform2fv(U.off, layout.off);
      gl.uniform1f(U.size, layout.size); gl.uniform1f(U.alpha, st.alpha); gl.uniform1f(U.lime, st.lime);
      gl.uniform1f(U.near, R - 170); gl.uniform1f(U.far, R + 170);
      gl.uniform4f(U.show, st.show[0], st.show[1], st.show[2], 0);
      gl.uniform1f(U.sweep, o.sweep(t));
      if (o.split) {
        const sx = Math.round(canvas.width * o.split());
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, 0, sx, canvas.height); gl.uniform1f(U.ep, 0); gl.uniform1f(U.diff, 0); gl.drawArrays(gl.POINTS, 0, N);
        gl.scissor(sx, 0, canvas.width - sx, canvas.height); gl.uniform1f(U.ep, 1); gl.uniform1f(U.diff, 1); gl.drawArrays(gl.POINTS, 0, N);
        gl.disable(gl.SCISSOR_TEST);
      } else { gl.uniform1f(U.ep, 1); gl.uniform1f(U.diff, 0); gl.drawArrays(gl.POINTS, 0, N); }
    }
    function project(p) { const m = st.mvp; if (!m) return null; const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]; if (w <= 0) return null; return [((x / w + st.off[0]) * 0.5 + 0.5) * st.w, (1 - ((y / w + st.off[1]) * 0.5 + 0.5)) * st.h]; }
    return { st, draw, resize, project };
  }

  /* sweep: crosses the site in 6.4 s, rests 1.6 s */
  const sweepAt = (period, cross) => (t) => { const k = (t % period) / cross; if (k > 1) return 999; const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; return -W - 12 + e * (2 * W + 24); };

  const views = [];
  function mount(canvas, o) {
    const c = Cloud(canvas, o); if (!c) return null;
    const v = { c, canvas, o, on: true, t0: performance.now(), last: performance.now() };
    new IntersectionObserver(([e]) => { v.on = e.isIntersecting; }, { rootMargin: '80px' }).observe(canvas);
    addEventListener('resize', () => c.resize());
    if (o.pointer) o.pointer.addEventListener('pointermove', (e) => { const r = o.pointer.getBoundingClientRect(); c.st.tpx = ((e.clientX - r.left) / r.width - 0.5) * 2; c.st.tpy = ((e.clientY - r.top) / r.height - 0.5) * 2; });
    views.push(v); return v;
  }

  const hero = document.querySelector('[data-cloud="hero"]');
  const heroV = hero && mount(hero, {
    yaw: 0.62, pointer: hero.closest('.hero'),
    sweep: sweepAt(8, 6.4),
    layout: (w, h) => w < 960 ? { pitch: 0.5, dist: w < 700 ? 300 : 280, fov: 0.62, off: [0.04, -0.6], size: 1.2 } : { pitch: 0.44, dist: w > 1700 ? 238 : 250, fov: 0.6, off: [0.3, -0.08], size: 1.3, tx: 12 },
  });
  const lay = document.querySelector('[data-cloud="layers"]');
  const layV = lay && mount(lay, {
    yaw: -0.5, pointer: lay,
    sweep: sweepAt(10, 7.2),
    layout: (w) => ({ pitch: 0.82, dist: w < 600 ? 330 : 238, fov: 0.62, off: [0, 0.02], size: 1.05, tx: -2, tz: 0 }),
  });

  const cmp = document.querySelector('[data-compare]');
  let split = 0.5;
  const cmpV = cmp && mount(cmp.querySelector('canvas'), {
    yaw: 0.18, spin: false, pointer: null, split: () => split,
    sweep: () => 999,
    layout: (w) => w < 600 ? { pitch: 0.6, dist: 250, fov: 0.62, off: [0, 0], size: 1.15, tx: 24, tz: -14 } : { pitch: 0.52, dist: 172, fov: 0.6, off: [0, 0.02], size: 1.25, tx: 24, tz: -14 },
  });
  if (cmp) {
    const hd = cmp.querySelector('[role="slider"]');
    const set = (f) => { split = Math.max(0.04, Math.min(0.96, f)); cmp.style.setProperty('--split', `${split * 100}%`); hd.setAttribute('aria-valuenow', Math.round(split * 100)); hd.setAttribute('aria-valuetext', `${Math.round(split * 100)}% scan 13`); if (reduce && cmpV) requestAnimationFrame(() => frame(performance.now(), true)); };
    const at = (e) => { const r = cmp.getBoundingClientRect(); set((e.clientX - r.left) / r.width); };
    cmp.addEventListener('pointerdown', (e) => { cmp.setPointerCapture(e.pointerId); cmp.classList.add('is-drag'); at(e); cmp.onpointermove = at; });
    cmp.addEventListener('pointerup', () => { cmp.onpointermove = null; cmp.classList.remove('is-drag'); });
    hd.addEventListener('keydown', (e) => { const k = { ArrowLeft: -0.05, ArrowRight: 0.05, Home: -1, End: 1 }[e.key]; if (k == null) return; e.preventDefault(); set(Math.abs(k) === 1 ? (k < 0 ? 0 : 1) : split + k); });
    set(innerWidth < 600 ? 0.24 : 0.36);
  }

  /* callouts follow the cloud */
  const anchors = { pile: [PILE.x, ground(PILE.x, PILE.z) + PILE.h, PILE.z], slab: [B.x1, PAD + FLOOR * 3, B.z1], crane: [CR.x, CR.top + 7, CR.z] };
  const callouts = [...document.querySelectorAll('[data-at]')].map((el) => ({ el, p: anchors[el.dataset.at] || el.dataset.at.split(',').map(Number) }));
  function placeCallouts() {
    if (!heroV) return;
    const r = heroV.canvas.getBoundingClientRect();
    callouts.forEach(({ el, p }) => { const s = heroV.c.project(p); if (!s) return; const ok = r.width < 960 ? s[1] > r.height * 0.74 && s[0] > 24 && s[0] < r.width - 24 && s[1] < r.height - 30 : s[0] > r.width * 0.42 && s[0] < r.width - 40 && s[1] > 90 && s[1] < r.height - 40; el.style.transform = `translate3d(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px, 0)`; el.classList.toggle('is-hidden', !ok); el.classList.toggle('is-flip', s[0] > r.width - 260); });
  }

  /* layer switches */
  document.querySelectorAll('[data-layer]').forEach((sw) => sw.addEventListener('change', () => {
    if (!layV) return; const k = sw.dataset.layer, on = sw.checked;
    if (k === 'lime') layV.c.st.limeT = on ? 1 : 0; else layV.c.st.showT[+k] = on ? 1 : 0;
    if (reduce) { const s = layV.c.st; s.show = [...s.showT]; s.lime = s.limeT; frame(performance.now(), true); }
  }));

  let hidden = false; document.addEventListener('visibilitychange', () => { hidden = document.hidden; if (!hidden) requestAnimationFrame(frame); });
  function frame(now, once) {
    views.forEach((v) => {
      if (!v.on && !once) return;
      const dt = Math.min(0.05, (now - v.last) / 1000); v.last = now;
      const t = (now - v.t0) / 1000;
      if (!reduce && v.o.spin !== false) v.c.st.yaw += dt * ((Math.PI * 2) / 120);
      if (v.o.spin === false) v.c.st.yaw = v.o.yaw + (reduce ? 0 : Math.sin(t * 0.09) * 0.22);
      v.c.draw(FIX ? +FIX : reduce ? 3.4 : t, reduce ? 1 : dt);
    });
    placeCallouts();
    if (!reduce && !hidden && !once) requestAnimationFrame(frame);
  }
  if (views.length) {
    root.classList.add('cloud-on');
    if (reduce) { views.forEach((v) => { v.c.st.alpha = 1; }); requestAnimationFrame((n) => { frame(n, true); setTimeout(() => frame(performance.now(), true), 400); }); addEventListener('resize', () => frame(performance.now(), true)); }
    else requestAnimationFrame(frame);
  }

  /* ---------- the section cut and its plan key ---------- */
  const cut = document.querySelector('[data-cut]');
  if (cut) {
    const cv = cut.querySelector('canvas.cut__points'), plan = cut.querySelector('canvas.cut__plan'), range = cut.querySelector('input[type="range"]'), out = cut.querySelector('[data-cut-at]');
    const ctx = cv.getContext('2d'), pctx = plan.getContext('2d');
    const marks = { top: cut.querySelector('[data-mark="top"]'), pad: cut.querySelector('[data-mark="pad"]'), pile: cut.querySelector('[data-mark="pile"]') };
    const Y0 = 33, Y1 = 90, SLAB = 1.1;
    let planImg = null;
    function drawPlan() {
      const w = plan.clientWidth, h = plan.clientHeight; plan.width = w * DPR; plan.height = h * DPR; pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!planImg) { planImg = document.createElement('canvas'); planImg.width = w * DPR; planImg.height = h * DPR; const g = planImg.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
        for (let i = 0; i < N; i += 2) { if (EPS[i] < -0.5) continue; const x = POS[i * 3], y = POS[i * 3 + 1], z = POS[i * 3 + 2]; const hh = Math.max(0, Math.min(1, (y - 37) / 25)); const c = CLS[i] > 2.5 ? COL.acc : hh < 0.5 ? COL.lo.map((v, j) => v + (COL.mid[j] - v) * hh * 2) : COL.mid.map((v, j) => v + (COL.hi[j] - v) * (hh - 0.5) * 2); g.fillStyle = rgb(c, CLS[i] > 2.5 ? 0.35 : 0.5); g.fillRect(((x + W) / (2 * W)) * w, ((D - z) / (2 * D)) * h, 1, 1); } }
      pctx.clearRect(0, 0, w, h); pctx.drawImage(planImg, 0, 0, w, h);
      const zc = +range.value, y = ((D - zc) / (2 * D)) * h;
      pctx.fillStyle = rgb(COL.acc, 1); pctx.fillRect(0, y - 0.75, w, 1.5);
      pctx.fillStyle = rgb(COL.acc, 0.12); pctx.fillRect(0, y - 5, w, 10);
    }
    function drawCut() {
      const w = cv.clientWidth, h = cv.clientHeight; cv.width = w * DPR; cv.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, w, h);
      const zc = +range.value; const X = (x) => ((x + W) / (2 * W)) * w, Y = (y) => h - ((y - Y0) / (Y1 - Y0)) * h;
      ctx.font = `400 12px ${css.getPropertyValue('--font-body')}`; ctx.textBaseline = 'bottom';
      for (let lv = 40; lv <= 85; lv += 5) { const y = Math.round(Y(lv)) + 0.5; ctx.strokeStyle = rgb(COL.rule, lv % 10 ? 0.35 : 0.7); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); if (lv % 10 === 0) { ctx.fillStyle = rgb(COL.muted, 0.9); ctx.fillText(`${lv} m`, 0, y - 4); } }
      let top = null, pile = null, padSum = 0, padN = 0;
      for (let i = 0; i < N; i++) { if (EPS[i] < -0.5) continue; const z = POS[i * 3 + 2]; const dz = Math.abs(z - zc); if (dz > SLAB) continue; const x = POS[i * 3], y = POS[i * 3 + 1], c = CLS[i];
        const hh = Math.max(0, Math.min(1, (y - 37) / 25)); const col = c > 2.5 ? COL.acc : hh < 0.5 ? COL.lo.map((v, j) => v + (COL.mid[j] - v) * hh * 2) : COL.mid.map((v, j) => v + (COL.hi[j] - v) * (hh - 0.5) * 2);
        ctx.fillStyle = rgb(col, 0.9 - (dz / SLAB) * 0.5); ctx.fillRect(X(x) - 0.75, Y(y) - 0.75, 1.5, 1.5);
        if (c === 1 && (!top || y > top[1])) top = [x, y];
        if (c === 3 && (!pile || y > pile[1])) pile = [x, y];
        if (c === 0 && x > 10 && x < 38 && Math.abs(y - 41.25) < 0.6) { padSum += y; padN++; } }
      const put = (el, p, txt) => { if (!el) return; if (!p) { el.hidden = true; return; } el.hidden = false; el.classList.toggle('is-flip', X(p[0]) > w - 150); el.style.left = `${(X(p[0]) / w) * 100}%`; el.style.top = `${(Y(p[1]) / h) * 100}%`; el.querySelector('b').textContent = txt; };
      put(marks.top, top, `${top ? top[1].toFixed(3) : ''}`);
      put(marks.pad, padN > 20 ? [28, padSum / padN] : null, `${(padSum / Math.max(1, padN)).toFixed(3)}`);
      put(marks.pile, pile, pile ? `${(pile[1] - ground(pile[0], zc)).toFixed(2)}` : '');
      out.textContent = `${zc >= 0 ? 'North' : 'South'} ${Math.abs(zc).toFixed(1)} m`;
      drawPlan();
    }
    let q = 0; const req = () => { cancelAnimationFrame(q); q = requestAnimationFrame(drawCut); };
    range.addEventListener('input', req);
    plan.addEventListener('pointerdown', (e) => { plan.setPointerCapture(e.pointerId); const mv = (ev) => { const r = plan.getBoundingClientRect(); range.value = Math.round((D - ((ev.clientY - r.top) / r.height) * 2 * D) * 2) / 2; req(); }; mv(e); plan.onpointermove = mv; plan.onpointerup = () => (plan.onpointermove = null); });
    addEventListener('resize', () => { planImg = null; req(); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(req);
  }

  /* ---------- the footer wordmark, scanned ---------- */
  const fm = document.querySelector('[data-points-word]');
  if (fm) {
    const c = fm.querySelector('canvas'), g = c.getContext('2d');
    let dots = [], on = false, t0 = performance.now();
    function build() {
      const w = fm.clientWidth, h = fm.clientHeight; c.width = w * DPR; c.height = h * DPR;
      const o = document.createElement('canvas'); o.width = w; o.height = h; const og = o.getContext('2d');
      const face = css.getPropertyValue('--font-display'); og.font = `200 100px ${face}`; const fs = Math.min(h * 1.3, (100 * w) / og.measureText(fm.dataset.pointsWord).width);
      og.fillStyle = '#fff'; og.font = `200 ${fs}px ${face}`; og.textBaseline = 'alphabetic';
      og.fillText(fm.dataset.pointsWord, -fs * 0.03, h * 0.94);
      const px = og.getImageData(0, 0, w, h).data, step = w < 700 ? 3.2 : 4.2; dots = []; seed = 77;
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step * (0.8 + rnd() * 0.4)) { const jx = x + (rnd() - 0.5) * step * 0.5, jy = y + (rnd() - 0.5) * step * 0.3; const a = px[(Math.floor(jy) * w + Math.floor(jx)) * 4 + 3]; if (a > 120) dots.push([jx, jy, rnd()]); }
    }
    function paint(now) {
      const w = fm.clientWidth, h = fm.clientHeight; g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, w, h);
      const t = reduce ? 0.35 : ((now - t0) / 1000 % 9) / 7; const sx = t <= 1 ? -40 + t * (w + 80) : -999;
      for (const [x, y, r] of dots) { const k = 1 - y / h; const d = sx - x; const lit = d >= 0 ? 0.6 * Math.exp(-d / 6) + 0.4 * Math.exp(-d / 120) : Math.exp(d / 3); const base = COL.mid.map((v, j) => v + (COL.hi[j] - v) * k * 0.5); const col = base.map((v, j) => v + (COL.hi[j] - v) * lit * 0.9); g.fillStyle = rgb(col, 0.6 + 0.4 * lit); g.fillRect(x, y, 1.3 + r * 0.6, 1.3 + r * 0.6); }
      if (on && !reduce && !document.hidden) requestAnimationFrame(paint);
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(); fm.classList.add('is-on'); paint(performance.now()); });
    new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) requestAnimationFrame(paint); }).observe(fm);
    addEventListener('resize', () => { build(); paint(performance.now()); });
  }
})();
