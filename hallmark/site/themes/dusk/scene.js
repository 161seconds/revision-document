// Dusk: the nav turns to glass once the page moves, the four jobs switch the pane, the month's nights grow in when seen.
(() => {
  const nav = document.querySelector('[data-nav]');
  const hero = document.querySelector('.hero');
  if (nav && hero) {
    const set = () => nav.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - 120);
    set();
    window.addEventListener('scroll', set, { passive: true });
  }

  const list = document.querySelector('[data-tabs]');
  if (list) {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const pick = (t, focus) => {
      for (const o of tabs) {
        const on = o === t;
        o.setAttribute('aria-selected', String(on));
        o.tabIndex = on ? 0 : -1;
        document.getElementById(o.getAttribute('aria-controls')).hidden = !on;
      }
      if (focus) t.focus();
    };
    for (const t of tabs) t.addEventListener('click', () => pick(t));
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); pick(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); pick(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); pick(tabs[tabs.length - 1], true); }
    });
  }

  const strip = document.querySelector('.strip');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (strip && !still && 'IntersectionObserver' in window) {
    const nights = [...strip.querySelectorAll('.night i')];
    nights.forEach((n, i) => { n.style.transitionDelay = `${i * 22}ms`; });
    strip.classList.add('is-waiting');
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { strip.classList.remove('is-waiting'); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(strip);
  }
})();
