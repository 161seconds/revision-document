// The hero's hand: desktop and phone pages side by side along one shallow arc, desk, phone, desk, phone, every one
// a real theme. Dealt up on arrival, a card lifts and names its theme under the pointer while its swatch on the
// proof's colour bar lights, a card opens its theme below, and "Deal again" gathers the hand and deals nine others.
(function () {
  const fan = document.querySelector('[data-fan]');
  if (!fan) return;
  const hero = fan.closest('.hero');
  const hand = fan.querySelector('[data-fan-hand]');
  const pool = JSON.parse(fan.querySelector('[data-fan-pool]').textContent);
  const bySlug = Object.fromEntries(pool.map((p) => [p.slug, p]));
  const bar = document.querySelector('[data-chips]');
  const chips = bar ? [...bar.children] : [];
  const reduce = HM.reduce.matches;
  const cards = [...hand.querySelectorAll('.card')];
  const desks = cards.filter((c) => c.dataset.kind === 'desk');
  const phones = cards.filter((c) => c.dataset.kind === 'phone');
  // left to right: desk, phone, desk, phone ... desk
  const row = [];
  desks.forEach((d, i) => { row.push(d); if (phones[i]) row.push(phones[i]); });
  const mid = (row.length - 1) / 2;
  let up = null;

  // each card's place: its slot's centre along the row, a shallow arc, a slight lean
  const place = () => {
    const W = desks[0].offsetWidth || 400, P = phones[0] ? phones[0].offsetWidth : W * 0.3;
    const gap = Math.max(14, W * 0.07);
    const xs = [];
    let x = 0;
    row.forEach((c, k) => { const w = c.dataset.kind === 'desk' ? W : P; if (k) x += gap; xs.push(x + w / 2); x += w; });
    const c0 = xs[Math.round(mid)];
    return row.map((c, k) => {
      const dx = xs[k] - c0, u = dx / W;
      return { c, x: dx, y: u * u * W * 0.055, r: u * 2.9 };
    });
  };
  const layout = () => {
    const W = desks[0].offsetWidth || 400;
    const spots = place();
    const ui = up ? row.indexOf(up) : -1;
    spots.forEach(({ c, x, y, r }, k) => {
      if (ui >= 0) {
        if (k === ui) { y -= W * 0.1; r *= 0.4; }
        else x += Math.sign(k - ui) * W * (Math.abs(k - ui) === 1 ? 0.06 : 0.035);
      }
      c.style.setProperty('--t', `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`);
      c.style.zIndex = String(20 - Math.round(Math.abs(k - mid) * 2));
      c.classList.toggle('is-up', c === up);
    });
    if (bar) {
      bar.classList.toggle('is-pick', ui >= 0);
      chips.forEach((ch, k) => ch.classList.toggle('is-pick', k === ui));
    }
  };
  const gather = () => row.forEach((c, k) => { c.style.setProperty('--t', `translate(${(k - mid) * 4}px, 170%) rotate(${(k - mid) * 1.2}deg)`); c.classList.remove('is-up'); });
  const deal = (delay = 0) => {
    row.forEach((c, k) => { c.style.transitionDelay = reduce ? '0ms' : `${delay + Math.abs(k - mid) * 55}ms`; });
    requestAnimationFrame(() => requestAnimationFrame(layout));
    setTimeout(() => row.forEach((c) => { c.style.transitionDelay = ''; }), delay + 1100);
  };
  // the proof's marks draw in and its colour bar rises, swatch by swatch, as the hand lands
  chips.forEach((ch, k) => { ch.style.transitionDelay = reduce ? '0ms' : `${520 + k * 45}ms`; });
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-proofed')));
  setTimeout(() => chips.forEach((ch) => { ch.style.transitionDelay = ''; }), 1600);
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));
  if (reduce) layout(); else { gather(); deal(200); }

  const lift = (c) => { if (c === up) return; up = c; layout(); };
  hand.addEventListener('pointerover', (e) => { const c = e.target.closest('.card'); if (c) lift(c); });
  hand.addEventListener('focusin', (e) => { const c = e.target.closest('.card'); if (c) lift(c); });
  hand.addEventListener('pointerleave', () => { up = null; layout(); });
  hand.addEventListener('focusout', (e) => { if (!hand.contains(e.relatedTarget)) { up = null; layout(); } });
  // the colour bar works the other way too: a swatch under the pointer lifts its card
  chips.forEach((ch, k) => { ch.addEventListener('pointerenter', () => lift(row[k])); ch.addEventListener('pointerleave', () => { up = null; layout(); }); });
  addEventListener('resize', layout);
  if ('ResizeObserver' in window) new ResizeObserver(() => layout()).observe(desks[0]);

  if (!reduce) hero.addEventListener('pointermove', (e) => {
    const dx = (e.clientX / innerWidth - 0.5) * 2;
    hand.style.transform = `translateX(${(dx * 10).toFixed(1)}px)`;
  });

  // a card opens its theme in the gallery below (a modified click still opens the page itself)
  hand.addEventListener('click', (e) => {
    const c = e.target.closest('.card'); if (!c || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const link = document.querySelector(`.th__link[data-slug="${c.dataset.slug}"]`);
    if (!link) return;
    e.preventDefault(); link.click();
  });

  // deal again: nine themes not on the table; the colour bar flips to the new palettes
  let busy = false;
  const btn = fan.querySelector('[data-fan-deal]');
  btn.addEventListener('click', async () => {
    if (busy) return; busy = true; btn.setAttribute('aria-busy', 'true');
    const now = new Set(cards.map((c) => c.dataset.slug));
    const rest = pool.filter((p) => !now.has(p.slug));
    for (let i = rest.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [rest[i], rest[j]] = [rest[j], rest[i]]; }
    const next = row.map((c, k) => ({ ...rest[k], kind: c.dataset.kind }));
    const imgs = next.map((p) => { const im = new Image(); im.src = `assets/${p.kind}/${p.slug}.webp`; return im; });
    up = null;
    row.forEach((c, k) => { c.style.transitionDelay = reduce ? '0ms' : `${(mid - Math.abs(k - mid)) * 30}ms`; });
    gather();
    chips.forEach((ch, k) => { ch.style.transitionDelay = reduce ? '0ms' : `${k * 30}ms`; ch.classList.add('is-flip'); });
    await Promise.all([...imgs.map((im) => (im.decode ? im.decode().catch(() => {}) : null)), new Promise((r) => setTimeout(r, reduce ? 0 : 560))]);
    row.forEach((c, k) => {
      const p = next[k];
      c.dataset.slug = p.slug; c.href = `themes/${p.slug}/`;
      const img = c.querySelector('img'); img.src = imgs[k].src;
      img.alt = `A ${p.kind === 'desk' ? 'desktop' : 'phone'} page in the ${p.name} theme`;
      c.querySelector('.card__name').textContent = p.name;
      const ch = chips[k], pal = (bySlug[p.slug] || {}).p;
      if (ch && pal) { ch.style.setProperty('--p', pal[0]); ch.style.setProperty('--n', pal[1]); ch.style.setProperty('--a', pal[2]); }
    });
    deal(0);
    chips.forEach((ch, k) => { ch.style.transitionDelay = reduce ? '0ms' : `${300 + k * 45}ms`; ch.classList.remove('is-flip'); });
    setTimeout(() => { busy = false; btn.removeAttribute('aria-busy'); chips.forEach((ch) => { ch.style.transitionDelay = ''; }); }, 1000);
  });
})();
