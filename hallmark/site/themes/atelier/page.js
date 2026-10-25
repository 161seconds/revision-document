/* The page: the scene fades in once the type is ready; one chosen scent is shared by the hero's
   fan, the rack of the four, the strips behind the card and the air. Without script every
   panel of the four shows in order and the hero is still. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* fade the scene in once, when the fonts have settled */
  let shown = false;
  const show = () => { if (shown) return; shown = true; requestAnimationFrame(() => root.classList.add('is-ready')); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(show);
  setTimeout(show, 1400);

  /* the chosen scent */
  const fan = [...document.querySelectorAll('.fan .blotter')];
  const tabs = [...document.querySelectorAll('.rack [role="tab"]')];
  const panel = (t) => document.getElementById(t.getAttribute('aria-controls'));

  const choose = (n, { focusTab = false, fromRack = false } = {}) => {
    root.dataset.scent = n;
    fan.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scent === String(n))));
    tabs.forEach((t) => {
      const on = t.dataset.scent === String(n);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const p = panel(t);
      if (on && p.hidden) { p.hidden = false; p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
      else if (!on) p.hidden = true;
      if (on && focusTab) t.focus();
    });
    if (window.Air) { window.Air.scent(n); setTimeout(() => window.Air.measure(), 650); }
  };

  fan.forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.scent);
    if (b.getAttribute('aria-pressed') === 'true') {
      /* a second press puts the strip down; the air returns to the house amber */
      b.setAttribute('aria-pressed', 'false');
      delete root.dataset.scent;
      if (window.Air) window.Air.scent(0);
      return;
    }
    choose(n);
  }));

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => choose(Number(t.dataset.scent), { fromRack: true }));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let j = null;
      if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      else if (k) j = (i + k + tabs.length) % tabs.length;
      if (j === null) return;
      e.preventDefault();
      choose(Number(tabs[j].dataset.scent), { focusTab: true, fromRack: true });
    });
  });

  /* the rack starts on No. 1 without tinting the air; reduced motion holds No. 1 chosen, still */
  tabs.forEach((t) => { const on = t.dataset.scent === '1'; panel(t).hidden = !on; t.tabIndex = on ? 0 : -1; });
  if (reduce) choose(1);

  /* the card: the day and hour carry into the button and the week */
  const form = document.querySelector('form.card');
  if (!form) return;
  const dayOut = form.querySelector('[data-day-out]');
  const hourOut = form.querySelector('[data-hour-out]');
  const mark = () => {
    const d = form.day.value;
    dayOut.textContent = d;
    hourOut.textContent = form.hour.value;
    document.querySelectorAll('.timetable [data-row]').forEach((r) => r.classList.toggle('is-chosen', r.dataset.row === d));
  };
  form.addEventListener('change', mark);
  mark();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const help = form.querySelector('[aria-live]');
    let first = null;
    form.querySelectorAll('input[required]').forEach((f) => {
      const ok = f.checkValidity();
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !first) first = f;
    });
    if (first) {
      help.textContent = first.type === 'email' ? 'That address looks incomplete. Write it as name@example.com.' : 'Add your name, so the reply can use it.';
      first.setAttribute('aria-describedby', help.id);
      first.focus();
      return;
    }
    if (!form.dataset.endpoint) { help.textContent = 'Nothing was sent: this card is not connected yet.'; return; }
    const btn = form.querySelector('[type="submit"]');
    btn.setAttribute('aria-busy', 'true');
    fetch(form.dataset.endpoint, { method: 'POST', body: new FormData(form) })
      .then((r) => { help.textContent = r.ok ? 'Your request for ' + form.day.value + ' reached the atelier.' : 'That did not go through. Try again in a minute.'; })
      .catch(() => { help.textContent = 'That did not go through. Try again in a minute.'; })
      .finally(() => btn.removeAttribute('aria-busy'));
  });
})();
