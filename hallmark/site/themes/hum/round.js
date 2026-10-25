/* The reading round: tap each word in order; each word read grows one plant set in type in the paper garden.
   The five-minute strip starts with the first word and tears a scrap away every five seconds. */
(() => {
  const card = document.querySelector('.play');
  if (!card) return;
  const tiles = [...card.querySelectorAll('.tile')];
  const plants = [...document.querySelectorAll('.plant--today')];
  const seeds = [...document.querySelectorAll('.seed')];
  const say = card.querySelector('.play__say');
  const again = card.querySelector('[data-again]');
  const hear = card.querySelector('[data-hear]');
  const sand = card.querySelector('.timer__sand');
  const track = card.querySelector('.timer__track');
  const time = card.querySelector('[data-time]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const counts = ['', 'One word, one plant.', 'Two words, two plants.', 'Three words, three plants.', 'Four words, four plants.', 'Five words, five plants.', 'Six words read, six plants grown.'];
  const TOTAL = 300;
  let n = tiles.length, left = 252, running = false, visible = true, timer = 0;

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const edge = () => {
    const r = [];
    for (let k = 0; k <= 7; k++) r.push(`calc(100% - ${(0.5 + Math.random() * 5.5).toFixed(1)}px) ${((k / 7) * 100).toFixed(1)}%`);
    return `polygon(1px 0%, ${r.join(', ')}, 0% 100%, 2.5px 70%, 0.5px 44%, 3px 22%)`;
  };
  const paint = () => { sand.style.setProperty('--t', (left / TOTAL).toFixed(4)); time.textContent = fmt(left); };
  const scrap = () => {
    if (reduce.matches) return;
    const s = document.createElement('i');
    s.className = 'scrap';
    s.style.left = `${sand.offsetWidth - 7}px`;
    const j = () => (Math.random() * 3).toFixed(1);
    s.style.clipPath = `polygon(${j()}px 0, 100% ${j()}px, calc(100% - ${j()}px) 55%, 100% 100%, ${j()}px calc(100% - ${j()}px), 0 50%)`;
    s.style.rotate = `${(Math.random() * 8 - 4).toFixed(1)}deg`;
    track.append(s);
    s.addEventListener('animationend', () => s.remove(), { once: true });
  };
  const tick = () => {
    if (!running || !visible || left <= 0) return;
    left -= 1;
    if (left % 5 === 0) { scrap(); sand.style.setProperty('--tear-end', edge()); }
    paint();
    if (left === 0) { running = false; say.textContent = 'That’s five minutes. See you tomorrow.'; }
  };
  const loop = () => { clearInterval(timer); if (running && visible) timer = setInterval(tick, 1000); };

  const show = (k) => {
    n = k;
    tiles.forEach((t, i) => { t.setAttribute('aria-pressed', String(i < k)); t.classList.toggle('is-next', i === k); });
    plants.forEach((p, i) => p.classList.toggle('is-grown', i < k));
    seeds.forEach((d, i) => d.classList.toggle('is-gone', i < k));
  };
  const reset = () => {
    show(0);
    say.textContent = 'Tap each word as you read it.';
    again.hidden = true;
  };
  const read = (t, i, e) => {
    if (i < n) return;
    if (i > n) {
      t.classList.remove('is-wrong'); void t.offsetWidth; t.classList.add('is-wrong');
      say.textContent = `First, “${tiles[n].textContent}”.`;
      return;
    }
    if (e && e.clientX) { const r = t.getBoundingClientRect(); t.style.setProperty('--cx', `${e.clientX - r.left}px`); t.style.setProperty('--cy', `${e.clientY - r.top}px`); }
    const hadFocus = document.activeElement === t;
    t.classList.remove('is-pop', 'is-nudge'); void t.offsetWidth; t.classList.add('is-pop');
    show(i + 1);
    say.textContent = counts[n];
    if (n < tiles.length) { if (hadFocus) tiles[n].focus({ preventScroll: true }); if (!running && left > 0) { running = true; loop(); } }
    else { running = false; loop(); again.hidden = false; if (hadFocus) again.focus({ preventScroll: true }); }
  };

  tiles.forEach((t, i) => {
    t.addEventListener('click', (e) => read(t, i, e));
    t.addEventListener('animationend', () => t.classList.remove('is-pop', 'is-wrong', 'is-nudge'));
  });
  again.addEventListener('click', () => { reset(); tiles[0].focus({ preventScroll: true }); });

  if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
    hear.hidden = false;
    hear.addEventListener('click', () => {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(tiles.map((t) => t.textContent).join(' '));
      u.lang = 'en-GB'; u.rate = 0.82;
      speechSynthesis.speak(u);
    });
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(); }).observe(card);

  // Reduced motion keeps the still: the sentence read and the garden grown, with a way to read it again.
  if (reduce.matches) { show(tiles.length); again.hidden = false; paint(); card.classList.add('is-live'); return; }
  left = TOTAL; paint(); reset();
  requestAnimationFrame(() => card.classList.add('is-live'));
  setTimeout(() => { if (n === 0) tiles[0].classList.add('is-nudge'); }, 1800);
})();
