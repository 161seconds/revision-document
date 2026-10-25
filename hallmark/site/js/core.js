// Shared bits: copy buttons, a tab-list helper, the agent tabs, section entrances, the nav's stuck state and the GitHub button.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  window.HM = { reduce };

  // copy: every [data-copy-root] holds its text in [data-copy-text]; the button turns into a tick for a moment
  const live = document.createElement('p');
  live.className = 'sr'; live.setAttribute('role', 'status');
  document.body.append(live);
  document.querySelectorAll('[data-copy-root]').forEach((root) => {
    const btn = root.querySelector('[data-copy]');
    const src = root.querySelector('[data-copy-text]');
    if (!btn || !src) return;
    let t;
    btn.addEventListener('click', async () => {
      const text = src.textContent.trim();
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const r = document.createRange(); r.selectNodeContents(src);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      }
      btn.classList.toggle('is-done', ok);
      live.textContent = ok ? 'Copied' : 'Select the text and copy it';
      clearTimeout(t); t = setTimeout(() => { btn.classList.remove('is-done'); live.textContent = ''; }, 1600);
    });
  });

  // tabs: arrows, Home and End move along a tab list; select(i) is the caller's
  HM.tabs = (list, select) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const go = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      if (focus) tabs[i].focus();
      select(i, tabs[i]);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => go(i));
      t.addEventListener('keydown', (e) => {
        const k = e.key; let n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0; else if (k === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); go(n, true); }
      });
    });
    return { tabs, go };
  };

  const ag = document.querySelector('[data-ag-tabs]');
  if (ag) HM.tabs(ag, (i, tab) => document.querySelectorAll('[data-ag-panel]').forEach((p) => { p.hidden = p.dataset.agPanel !== tab.dataset.ag; }));

  // entrance: each section's content rises once as it arrives
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const blocks = [...document.querySelectorAll('.sec > .wrap, .made > .wrap')].filter((b) => b.getBoundingClientRect().top > innerHeight);
    blocks.forEach((b) => b.classList.add('reveal'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    blocks.forEach((b) => io.observe(b));
  }

  // the nav takes a paper bar once the page moves
  const nav = document.querySelector('[data-nav]');
  const dark = [...document.querySelectorAll('.made, .foot')];
  const stuck = () => {
    nav.classList.toggle('is-stuck', scrollY > 8);
    const y = nav.offsetHeight - 1;
    nav.classList.toggle('is-dark', dark.some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
  };
  addEventListener('scroll', stuck, { passive: true }); stuck();

  // the GitHub button: a light that follows the pointer, and the live star count (or nothing)
  const gh = document.querySelector('[data-gh]');
  if (gh) {
    const box = gh.querySelector('[data-gh-count]');
    const out = gh.querySelector('[data-gh-n]');
    if (window.fetch) fetch('https://api.github.com/repos/Nutlope/hallmark', { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const n = d && d.stargazers_count;
        if (typeof n !== 'number') return;
        const txt = n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n);
        box.hidden = false;
        gh.setAttribute('aria-label', `Hallmark on GitHub, ${n.toLocaleString('en-GB')} stars`);
        // an odometer: each digit rolls up to its place once
        out.textContent = '';
        [...txt].forEach((ch, k) => {
          if (!/\d/.test(ch)) { const s = document.createElement('span'); s.textContent = ch; out.append(s); return; }
          const w = document.createElement('span'); w.className = 'odo';
          const col = document.createElement('span'); col.className = 'odo__col';
          for (let d = 0; d <= 9; d++) { const s = document.createElement('span'); s.textContent = d; col.append(s); }
          w.append(col); out.append(w);
          if (reduce.matches) col.style.transform = `translateY(${-+ch * 1.2}em)`;
          else { col.style.transitionDelay = `${k * 90}ms`; requestAnimationFrame(() => requestAnimationFrame(() => { col.style.transform = `translateY(${-+ch * 1.2}em)`; })); }
        });
      })
      .catch(() => {});
  }
})();
