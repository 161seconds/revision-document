// burrow: the hare in glyphs, install tabs, copy, and the session that lights the host map
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- the hare: a picture printed in the dotfiles themselves
  const DOT = `export EDITOR=nvim
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
alias gs='git status -sb' ll='ls -lah' v=nvim
setopt hist_ignore_dups share_history
bindkey -e
[user] name = you email = you@host
[pull] rebase = true
[init] defaultBranch = main
vim.opt.number = true vim.opt.relativenumber = true
vim.opt.expandtab = true vim.opt.shiftwidth = 2
set -g mouse on set -g base-index 1
Host pi HostName pi.local User pi
Host desk HostName desk.lan ForwardAgent yes
`.replace(/\s+/g, '');
  const NOISE = '!#$%&*+-./:;<=>?@[]^_{|}~0123456789abcdefghijklmnopqrstuvwxyz';
  const css = getComputedStyle(document.documentElement);
  const ramp = Array.from({ length: 8 }, (_, i) => css.getPropertyValue(`--glyph-${i}`).trim());
  const hot = css.getPropertyValue('--color-accent').trim();
  const fontReady = document.fonts ? document.fonts.load('500 12px "Martian Mono"') : Promise.resolve();
  // one renderer for every picture on the page: a grid of levels, each lit cell one dotfile character
  const art = (box, H, { align = 'end', delay = 0 } = {}) => {
    const cv = box.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const cells = [];
    let k = 0;
    H.lv.forEach((row, y) => [...row].forEach((c, x) => { const v = +c; if (v) cells.push({ x, y, v, ch: DOT[k++ % DOT.length], at: 0, heat: 0 }); }));
    const grid = new Map(cells.map((c) => [c.y * H.cols + c.x, c]));
    let cw = 0, ch = 0, ox = 0, oy = 0, fs = 0, t0 = 0, raf = 0;
    const size = () => {
      const r = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      cw = Math.min(r.width / H.cols, r.height / (H.rows * H.ratio));
      ch = cw * H.ratio; fs = cw * 1.62;
      ox = align === 'end' ? r.width - cw * H.cols : 0; oy = r.height - ch * H.rows;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    };
    // dim cells set smaller, bright ones full size: the picture keeps its tone
    const fonts = Array.from({ length: 9 }, (_, v) => `${v > 6 ? 700 : 500} ${(0.62 + 0.38 * Math.min(1, v / 6)) * 1}px "Martian Mono", monospace`);
    const setFont = (v) => { ctx.font = fonts[v].replace(/^(\d+) ([\d.]+)px/, (m, w, s) => `${w} ${(s * fs).toFixed(2)}px`); };
    const draw = (now) => {
      raf = 0;
      const t = now - t0;
      let busy = false, last = -1;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const c of cells) {
        const px = ox + c.x * cw + cw / 2, py = oy + c.y * ch + ch / 2;
        if (t < c.at) { busy = true; continue; }
        const lvl = c.heat > 0.04 || t < c.at + 260 ? 8 : c.v;
        if (lvl !== last) { setFont(lvl); last = lvl; }
        if (t < c.at + 260) { busy = true; ctx.fillStyle = ramp[Math.min(7, c.v + 1)]; ctx.fillText(NOISE[(Math.random() * NOISE.length) | 0], px, py); continue; }
        if (c.heat > 0.04) {
          busy = true;
          ctx.fillStyle = c.heat > 0.5 ? hot : ramp[Math.min(7, c.v + 2)];
          ctx.fillText(c.heat > 0.25 ? NOISE[(Math.random() * NOISE.length) | 0] : c.ch, px, py);
          c.heat *= 0.9;
          continue;
        }
        c.heat = 0;
        ctx.fillStyle = ramp[c.v - 1];
        ctx.fillText(c.ch, px, py);
      }
      if (busy) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const start = () => {
      box.classList.add('is-live');
      size();
      // arrival: rows resolve top to bottom, a little ragged, in about a second and a half
      cells.forEach((c) => { c.at = still ? -1e6 : delay + c.y * (1100 / H.rows) + Math.random() * 420; });
      t0 = performance.now();
      kick();
    };
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (box.classList.contains('is-live')) { size(); kick(); } }).observe(box);
    else addEventListener('resize', () => { size(); kick(); });
    if (!still) box.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      const gx = (e.clientX - r.left - ox) / cw, gy = (e.clientY - r.top - oy) / ch;
      const R = 7;
      for (let y = Math.floor(gy - R / 2); y <= gy + R / 2; y++) for (let x = Math.floor(gx - R); x <= gx + R; x++) {
        const c = grid.get(y * H.cols + x); if (!c) continue;
        const d = Math.hypot((x - gx) / R, (y - gy) / (R / 2));
        if (d < 1) c.heat = Math.max(c.heat, 1 - d);
      }
      kick();
    });
    return start;
  };
  document.querySelectorAll('[data-art]').forEach((box) => {
    const data = window.ART && window.ART[box.dataset.art];
    if (!data) return;
    const start = art(box, data, { align: box.dataset.art === 'mark' ? 'start' : 'end' });
    if (box.dataset.art === 'hare' || !('IntersectionObserver' in window)) { fontReady.then(start, start); return; }
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); fontReady.then(start, start); } }, { threshold: 0.3 }).observe(box);
  });

  // ---- install tabs
  document.querySelectorAll('[data-tabs]').forEach((el) => {
    const tabs = [...el.querySelectorAll('[role="tab"]')];
    const pick = (t) => { tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; const n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus(); });
    });
  });

  // ---- copy
  const live = document.createElement('p'); live.className = 'visually-hidden'; live.setAttribute('aria-live', 'polite'); document.body.append(live);
  document.querySelectorAll('.copy[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.classList.add('is-done'); live.textContent = 'Copied'; setTimeout(() => { b.classList.remove('is-done'); live.textContent = ''; }, 1400); }
    catch { live.textContent = 'Copy failed; select the command instead.'; }
  }));

  // ---- the session types itself once, and each host lights up on the map as it finishes
  const sec = document.querySelector('.sync');
  const out = sec && sec.querySelector('[data-session]');
  if (!out || still || !('IntersectionObserver' in window)) { sec && sec.classList.add('is-done'); return; }
  const lines = [...out.querySelectorAll('.ln')];
  const typed = new Map();
  lines.forEach((l) => { l.hidden = true; const b = l.querySelector('[data-type]'); if (b) { typed.set(b, b.textContent); b.textContent = ''; } });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const light = (h, cls) => sec.querySelectorAll(`[data-path="${h}"], [data-node="${h}"]`).forEach((n) => n.classList.add(cls));
  const run = async () => {
    for (const l of lines) {
      l.hidden = false;
      const b = l.querySelector('[data-type]');
      if (b) { const s = typed.get(b); for (let i = 1; i <= s.length; i++) { b.textContent = s.slice(0, i); await wait(24); } await wait(260); }
      if (b && /sync/.test(typed.get(b))) { ['desk', 'pi', 'work', 'all'].forEach((h) => light(h, 'is-busy')); await wait(700); }
      const h = l.dataset.host;
      if (h) { light(h, 'is-on'); light('all', 'is-on'); await wait(420); }
      else await wait(120);
    }
    sec.classList.add('is-done');
  };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); run(); } }, { threshold: 0.45 }).observe(sec);
})();
