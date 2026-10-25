// Made with Hallmark: the finished pages on a wheel. Drag or swipe to turn it (it carries on a little and settles
// on a page), use the arrows or the keyboard, or click a page at the side to bring it round. The page in front opens
// in a new tab. While nobody touches it, the wheel turns slowly on its own, and stops for good once it is touched.
(function () {
  const wheel = document.querySelector('[data-wheel]');
  if (!wheel) return;
  const ring = wheel.querySelector('[data-wheel-ring]');
  const cards = [...ring.querySelectorAll('.wheel__card')];
  const n = cards.length;
  const step = 360 / n;
  const cap = document.querySelector('[data-wheel-cap]');
  const reduce = HM.reduce.matches;
  wheel.style.setProperty('--n', n);

  let turn = 0, vel = 0, target = null, drag = false, lastX = 0, lastT = 0, moved = 0, idle = !reduce, front = -1, raf = 0, visible = false;

  const radius = () => {
    const w = wheel.querySelector('.wheel__stage').getBoundingClientRect().width;
    wheel.style.setProperty('--r3d', `${(w / 2 + Math.max(16, w * 0.04)) / Math.tan(Math.PI / n)}px`);
  };
  radius(); addEventListener('resize', radius);

  const frontOf = (t) => (((Math.round(-t / step) % n) + n) % n);
  const paint = () => {
    ring.style.setProperty('--turn', `${turn}deg`);
    cards.forEach((c, k) => {
      let a = ((k * step + turn) % 360 + 540) % 360 - 180; // angle from the front, -180..180
      const d = Math.min(1, Math.abs(a) / 80);
      c.style.filter = `brightness(${1 - d * 0.55}) saturate(${1 - d * 0.3})`;
      c.style.setProperty('--lift', `${(1 - Math.min(1, Math.abs(a) / step)) * 90}px`);
      c.tabIndex = Math.abs(a) < step / 2 ? 0 : -1;
    });
    const f = frontOf(turn);
    if (f !== front) {
      front = f;
      const c = cards[f];
      cap.innerHTML = '';
      const a = document.createElement('a'); a.href = c.getAttribute('href'); a.target = '_blank'; a.rel = 'noopener';
      const b = document.createElement('b'); b.textContent = c.dataset.name;
      const s = document.createElement('span'); s.textContent = c.dataset.meta + ' \u2197';
      a.append(b, s); cap.append(a);
    }
  };
  const loop = () => {
    raf = 0;
    if (drag) { paint(); raf = requestAnimationFrame(loop); return; }
    if (target !== null) {
      const d = target - turn;
      turn += d * 0.14;
      if (Math.abs(d) < 0.05) { turn = target; target = null; }
    } else if (Math.abs(vel) > 0.02) {
      turn += vel; vel *= 0.93;
      if (Math.abs(vel) <= 0.02) target = Math.round(turn / step) * step;
    } else if (idle && visible) {
      turn -= 0.06;
    }
    paint();
    if (target !== null || Math.abs(vel) > 0.02 || (idle && visible)) raf = requestAnimationFrame(loop);
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const to = (k) => { idle = false; vel = 0; const cur = Math.round(-turn / step); let d = ((k - cur) % n + n) % n; if (d > n / 2) d -= n; target = -(cur + d) * step; go(); };
  paint();

  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) go(); }, { threshold: 0.2 }).observe(wheel);

  wheel.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = true; idle = false; target = null; vel = 0; moved = 0; lastX = e.clientX; lastT = performance.now();
    wheel.classList.add('is-drag');
    try { wheel.setPointerCapture(e.pointerId); } catch (err) {}
    go();
  });
  wheel.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - lastX;
    const deg = dx * (step / (cards[0].offsetWidth * 0.9));
    turn += deg; moved += Math.abs(dx);
    vel = deg / Math.max(1, now - lastT) * 16;
    lastX = e.clientX; lastT = now;
  });
  const release = () => {
    if (!drag) return;
    drag = false; wheel.classList.remove('is-drag');
    if (Math.abs(vel) < 0.3) { vel = 0; target = Math.round(turn / step) * step; }
    go();
  };
  wheel.addEventListener('pointerup', release);
  wheel.addEventListener('pointercancel', release);
  wheel.addEventListener('lostpointercapture', release);

  // a drag never opens a page; a click on a side page brings it round instead of opening it
  wheel.addEventListener('click', (e) => {
    const c = e.target.closest('.wheel__card'); if (!c) return;
    if (moved > 6) { e.preventDefault(); return; }
    const k = cards.indexOf(c);
    if (k !== frontOf(turn)) { e.preventDefault(); to(k); }
  }, true);

  // a horizontal swipe on a trackpad turns it too
  wheel.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault(); idle = false; target = null;
    vel = -e.deltaX * 0.02; go();
  }, { passive: false });

  wheel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); to(frontOf(turn) + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); to(frontOf(turn) - 1); }
  });
  cards.forEach((c, k) => c.addEventListener('focus', () => { if (k !== frontOf(turn)) to(k); }));
  document.querySelector('[data-wheel-prev]').addEventListener('click', () => to(frontOf(turn) - 1));
  document.querySelector('[data-wheel-next]').addEventListener('click', () => to(frontOf(turn) + 1));
})();
