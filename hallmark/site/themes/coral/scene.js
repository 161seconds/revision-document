/* Tilly: the desk plays its story once, the pinned run follows the scroll, the tone control speaks */
window.hallmarkSlots = (m) => { for (const [k, v] of Object.entries(m)) { const s = document.querySelector(`[data-slot="${k}"]`); if (!s) continue; const im = new Image(); im.src = typeof v === 'string' ? v : v.src; im.alt = (typeof v === 'object' && v.alt) || s.dataset.alt || ''; s.querySelectorAll(':scope > img').forEach((o) => o.remove()); s.prepend(im); } };

/* The story: the reminder slides into the window envelope, is marked sent, the reply card arrives and tucks under
   the invoice, the invoice is pressed Paid. Transforms and opacity only. */
(() => {
  const root = document.documentElement;
  const scene = document.querySelector('[data-scene]');
  if (!scene || !root.classList.contains('story')) return;
  const $ = (s) => scene.querySelector(s);
  const inner = $('.scene__in'), file = $('[data-file]'), letter = $('[data-letter]'), lift = $('[data-lift]');
  const ppi = $('[data-ppi]'), reply = $('.reply'), paid = $('[data-paid]');
  const anims = [];
  let started = false, visible = true;
  const play = (el, kf, o) => { const a = el.animate(kf, { fill: 'both', ...o }); anims.push(a); if (!visible) a.pause(); return a; };
  const ease = { out: 'cubic-bezier(0.16, 1, 0.3, 1)', glide: 'cubic-bezier(0.45, 0, 0.15, 1)', soft: 'cubic-bezier(0.4, 0, 0.2, 1)', press: 'cubic-bezier(0.5, 0, 0.75, 0)' };

  const start = () => {
    if (started) return; started = true;
    play(inner, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: ease.out });
    root.classList.remove('story');
    // The letter rests on the open flap, then slides down through the mouth until the address sits in the window
    play(letter, [
      { transform: 'translate(calc(var(--u) * 0.9), calc(var(--u) * -16.2)) rotate(-2.2deg)', easing: ease.glide },
      { offset: 0.2, transform: 'translate(calc(var(--u) * 0.9), calc(var(--u) * -16.2)) rotate(-2.2deg)', easing: ease.glide },
      { transform: 'translate(0px, 0px) rotate(0deg)' }
    ], { duration: 1700, delay: 700 });
    play(lift, [{ opacity: 1 }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.75 }, { opacity: 0 }], { duration: 1700, delay: 700 });
    play(ppi, [{ opacity: 0 }, { opacity: 1 }], { duration: 480, delay: 2550, easing: ease.soft });
    play(reply, [
      { opacity: 0, transform: 'translate(calc(var(--u) * 22), calc(var(--u) * 6)) rotate(16deg)' },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, transform: 'translate(0px, 0px) rotate(7deg)' }
    ], { duration: 1150, delay: 3050, easing: ease.out });
    play(paid, [
      { opacity: 0, transform: 'rotate(-4deg) scale(1.14)', easing: ease.press },
      { opacity: 1, offset: 0.55, transform: 'rotate(-4deg) scale(0.985)', easing: ease.out },
      { opacity: 1, transform: 'rotate(-4deg) scale(1)' }
    ], { duration: 520, delay: 4400 });
    play(file, [
      { transform: 'rotate(-3deg)' },
      { offset: 0.5, transform: 'rotate(-3deg) translate(0.4px, 0.6px)', easing: ease.out },
      { transform: 'rotate(-3deg)' }
    ], { duration: 520, delay: 4400, easing: ease.press });
  };

  // Hold the first frame back until the type is in, then play once; pause whenever the desk is off screen
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    anims.forEach((a) => { if (a.playState === 'finished') return; visible ? a.play() : a.pause(); });
    if (visible && !started) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(start);
  }, { threshold: 0.15 });
  io.observe(scene);
  setTimeout(() => { if (!started) root.classList.remove('story'); }, 4000);
})();

/* The pinned run: the panel nearest the middle of the screen sets the invoice's state */
document.querySelectorAll('[data-pin]').forEach((pin) => {
  const fig = pin.querySelector('.pin__visual'), panels = [...pin.querySelectorAll('.pin__panel')];
  const wide = matchMedia('(min-width: 60rem)');
  const set = (n) => { fig.dataset.step = n; panels.forEach((p) => p.classList.toggle('is-on', p.dataset.step === String(n))); };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && wide.matches) set(e.target.dataset.step); }), { rootMargin: '-45% 0px -45% 0px' });
  panels.forEach((p) => io.observe(p));
  const sync = () => set(wide.matches ? (panels.find((p) => p.classList.contains('is-on')) || panels[0]).dataset.step : 3);
  wide.addEventListener('change', sync); sync();
});

/* The tone control: the letter is rewritten by CSS; say the new line for screen readers */
(() => {
  const say = document.querySelector('[data-tone-say]');
  document.querySelectorAll('input[name="tone"]').forEach((i) => i.addEventListener('change', () => {
    const line = document.querySelector(`[data-tone="${i.value}"]`);
    if (say && line) say.textContent = `${i.parentElement.textContent.trim()}: ${line.textContent}`;
  }));
})();
