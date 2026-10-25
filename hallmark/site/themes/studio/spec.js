/* Field Office: the measuring tool, the three systems and the size labels. The page reads whole without this file. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* The measuring tool: point at a letter or a block on the sheet to see its redlines */
  const trim = document.querySelector('[data-trim]');
  if (trim) {
    const svg = trim.querySelector('.redlines');
    const readout = trim.querySelector('[data-readout]');
    const hint = matchMedia('(hover: none)').matches ? 'Tap a letter to measure it' : 'Point at a letter to measure it';
    readout.textContent = hint;
    let key = null;
    let pending = null;

    const px = (v) => Math.round(v) + 0.5;
    const make = (name, attrs, parent = svg) => {
      const n = document.createElementNS(NS, name);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent.appendChild(n);
      return n;
    };
    const tag = (x, y, text) => {
      const g = make('g', { class: 'rl-tag' });
      const t = make('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
      t.textContent = text;
      const b = t.getBBox();
      g.insertBefore(make('rect', { x: b.x - 5, y: b.y - 2, width: b.width + 10, height: b.height + 4, rx: 1 }, g), t);
    };
    const hdim = (x1, x2, y, text) => {
      if (Math.abs(x2 - x1) < 3) return;
      const Y = px(y);
      make('line', { x1, y1: Y, x2, y2: Y });
      make('line', { x1: px(x1), y1: Y - 4, x2: px(x1), y2: Y + 5 });
      make('line', { x1: px(x2), y1: Y - 4, x2: px(x2), y2: Y + 5 });
      tag((x1 + x2) / 2, Y, text);
    };
    const vdim = (y1, y2, x, text) => {
      if (Math.abs(y2 - y1) < 3) return;
      const X = px(x);
      make('line', { x1: X, y1, x2: X, y2 });
      make('line', { x1: X - 4, y1: px(y1), x2: X + 5, y2: px(y1) });
      make('line', { x1: X - 4, y1: px(y2), x2: X + 5, y2: px(y2) });
      tag(X, (y1 + y2) / 2, text);
    };
    const local = (r, o) => ({ left: r.left - o.left, right: r.right - o.left, top: r.top - o.top, bottom: r.bottom - o.top, width: r.width, height: r.height });
    const clear = () => { svg.replaceChildren(); key = null; readout.textContent = hint; };

    const measureBlock = (el) => {
      const o = trim.getBoundingClientRect();
      const W = o.width; const H = o.height;
      const R = local(el.getBoundingClientRect(), o);
      const others = [...trim.querySelectorAll('[data-measure]')]
        .filter((c) => c !== el && !c.contains(el) && !el.contains(c) && c.getClientRects().length)
        .map((c) => local(c.getBoundingClientRect(), o));
      svg.replaceChildren();
      make('rect', { class: 'rl-box', x: px(R.left), y: px(R.top), width: Math.round(R.width) - 1, height: Math.round(R.height) - 1 });
      const ov = (a1, a2, b1, b2) => Math.min(a2, b2) - Math.max(a1, b1);
      const midY = (c) => c ? (Math.max(R.top, c.top) + Math.min(R.bottom, c.bottom)) / 2 : R.top + R.height / 2;
      const midX = (c) => c ? (Math.max(R.left, c.left) + Math.min(R.right, c.right)) / 2 : R.left + R.width / 2;
      const pick = (list, f) => list.reduce((best, c) => (best == null || f(c, best) ? c : best), null);
      const L = pick(others.filter((c) => c.right <= R.left + 1 && ov(R.top, R.bottom, c.top, c.bottom) > 0), (c, b) => c.right > b.right);
      const Rt = pick(others.filter((c) => c.left >= R.right - 1 && ov(R.top, R.bottom, c.top, c.bottom) > 0), (c, b) => c.left < b.left);
      const U = pick(others.filter((c) => c.bottom <= R.top + 1 && ov(R.left, R.right, c.left, c.right) > 0), (c, b) => c.bottom > b.bottom);
      const D = pick(others.filter((c) => c.top >= R.bottom - 1 && ov(R.left, R.right, c.left, c.right) > 0), (c, b) => c.top < b.top);
      for (const c of [L, Rt, U, D]) if (c) make('rect', { class: 'rl-near', x: px(c.left), y: px(c.top), width: Math.round(c.width) - 1, height: Math.round(c.height) - 1 });
      const lx = L ? L.right : 0; hdim(lx, R.left, midY(L), Math.round(R.left - lx));
      const rx = Rt ? Rt.left : W; hdim(R.right, rx, midY(Rt), Math.round(rx - R.right));
      const uy = U ? U.bottom : 0; vdim(uy, R.top, midX(U), Math.round(R.top - uy));
      const dy = D ? D.top : H; vdim(R.bottom, dy, midX(D), Math.round(dy - R.bottom));
      readout.textContent = `${el.dataset.measure}, ${Math.round(R.width)} × ${Math.round(R.height)} px`;
    };

    const measureLetter = (span, x, y) => {
      const node = span.firstChild;
      if (!node) return;
      const range = document.createRange();
      for (let i = 0; i < node.length; i++) {
        range.setStart(node, i); range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        if (x < r.left || x >= r.right || y < r.top || y > r.bottom) continue;
        const k = span.textContent + i;
        if (k === key) return;
        key = k;
        const o = trim.getBoundingClientRect();
        const R = local(r, o);
        const fs = parseFloat(getComputedStyle(span).fontSize);
        const base = R.top + 1.02 * fs;
        const top = base - 0.8 * fs; const bot = base + 0.247 * fs;
        const units = Math.round((R.width / fs) * 1000);
        svg.replaceChildren();
        make('rect', { class: 'rl-glyph', x: px(R.left), y: px(top), width: Math.round(R.width), height: Math.round(bot - top) });
        hdim(R.left, R.right, bot + 18, units);
        readout.textContent = `${node.data[i]}, advance ${units} of 1000`;
        return;
      }
    };

    const run = () => {
      const e = pending; pending = null;
      if (!e) return;
      const t = e.target instanceof Element ? e.target.closest('[data-letters], [data-measure]') : null;
      if (!t || !trim.contains(t)) { if (key) clear(); return; }
      if (t.matches('[data-letters]')) { measureLetter(t, e.clientX, e.clientY); return; }
      if (key === t) return;
      key = t;
      measureBlock(t);
    };
    const queue = (e) => { const first = !pending; pending = e; if (first) requestAnimationFrame(run); };
    trim.addEventListener('pointermove', queue);
    trim.addEventListener('pointerdown', queue);
    trim.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { pending = null; clear(); } });
    trim.addEventListener('focusin', (e) => { const t = e.target.closest('[data-measure]'); if (t) { key = t; measureBlock(t); } });
    trim.addEventListener('focusout', clear);
    addEventListener('resize', clear, { passive: true });
  }

  /* One name, three systems: tabs that work by click and arrow keys, and turn by themselves while the section is in view */
  const tabs = [...document.querySelectorAll('[role="tab"][data-sys]')];
  const boards = [...document.querySelectorAll('[data-board]')];
  const stage = document.getElementById('stage');
  if (tabs.length && stage) {
    let idx = 0; let timer = 0; let held = false; let seen = false; let chosen = false;
    const select = (i, focus) => {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === idx)); t.tabIndex = k === idx ? 0 : -1; });
      boards.forEach((b, k) => b.classList.toggle('is-on', k === idx));
      stage.setAttribute('aria-labelledby', tabs[idx].id);
      if (focus) tabs[idx].focus();
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    const start = () => { if (reduce || chosen || timer) return; timer = setInterval(() => { if (seen && !held && !document.hidden) select(idx + 1); }, 4200); };
    const choose = (i, focus) => { chosen = true; stop(); select(i, focus); };
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => choose(k));
      t.addEventListener('keydown', (e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (step) { e.preventDefault(); choose(idx + step, true); }
        else if (e.key === 'Home') { e.preventDefault(); choose(0, true); }
        else if (e.key === 'End') { e.preventDefault(); choose(tabs.length - 1, true); }
      });
    });
    const section = stage.closest('section');
    section.addEventListener('pointerenter', () => { held = true; });
    section.addEventListener('pointerleave', () => { held = false; });
    section.addEventListener('focusin', () => { held = true; });
    section.addEventListener('focusout', () => { held = false; });
    new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen) start(); else stop(); }, { threshold: 0.4 }).observe(section);
  }

  /* Guides land on whole device pixels, so a 1px rule stays one crisp line */
  const guides = [...document.querySelectorAll('.g')];
  const snap = () => {
    const d = devicePixelRatio || 1;
    guides.forEach((g) => {
      g.style.translate = '';
      const y = g.getBoundingClientRect().top + scrollY;
      const off = Math.round(y * d) / d - y;
      if (Math.abs(off) > 0.01) g.style.translate = `0 ${off.toFixed(3)}px`;
    });
  };
  if (guides.length) {
    snap();
    if (document.fonts) document.fonts.ready.then(snap);
    let s = 0;
    addEventListener('resize', () => { cancelAnimationFrame(s); s = requestAnimationFrame(snap); }, { passive: true });
  }

  /* The size test: each line prints the size it is set at */
  const sizes = [...document.querySelectorAll('[data-size]')];
  const label = () => sizes.forEach((s) => {
    const dd = s.closest('.specimen__row').querySelector('dd');
    s.textContent = String(Math.round(parseFloat(getComputedStyle(dd).fontSize)));
  });
  if (sizes.length) {
    label();
    let f = 0;
    addEventListener('resize', () => { cancelAnimationFrame(f); f = requestAnimationFrame(label); }, { passive: true });
  }
})();
