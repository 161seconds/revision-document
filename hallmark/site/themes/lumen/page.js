// quarry: the answer streams in once, a sample day of traffic under one flat price line, code tabs and copy.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the answer streams in word by word, once
  const a = document.querySelector('[data-stream]');
  if (a && !still) {
    const full = a.textContent;
    const words = full.split(/(\s+)/);
    a.textContent = '';
    let i = 0;
    setTimeout(function tick() {
      a.textContent += words[i++] || '';
      if (i < words.length) setTimeout(tick, 60 + Math.random() * 50);
      else a.classList.add('is-done');
    }, 700);
  } else if (a) a.classList.add('is-done');

  // a sample day: the traffic moves, the price line stays flat
  const plot = document.querySelector('[data-day]');
  if (plot) {
    const N = 96, pts = [];
    for (let i = 0; i <= N; i++) {
      const h = i / N * 24;
      const base = 0.18 + 0.34 * Math.exp(-Math.pow((h - 14) / 4.2, 2)) + 0.2 * Math.exp(-Math.pow((h - 20.5) / 1.6, 2));
      const spike = h > 9.8 && h < 10.6 ? 0.36 * Math.sin((h - 9.8) / 0.8 * Math.PI) : 0;
      pts.push([i / N * 1000, 300 - (base + spike + 0.025 * Math.sin(i * 1.7)) * 300]);
    }
    const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
    plot.innerHTML = `<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
      <path class="chart__area" d="${d} L1000 300 L0 300 Z"/>
      <path class="chart__load" d="${d}" vector-effect="non-scaling-stroke"/>
      <line class="chart__rate" x1="0" x2="1000" y1="70" y2="70" vector-effect="non-scaling-stroke"/>
    </svg>`;
  }

  // code tabs and copy
  const tabs = [...document.querySelectorAll('.code__tabs [role="tab"]')];
  const pick = (t) => tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => { const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (k) { const n = tabs[(i + k + tabs.length) % tabs.length]; pick(n); n.focus(); } });
  });
  const copy = document.querySelector('[data-copy]');
  if (copy) copy.addEventListener('click', async () => {
    const pre = document.querySelector('.code__body pre[role="tabpanel"]:not([hidden])');
    try { await navigator.clipboard.writeText(pre.textContent); copy.classList.add('is-done'); copy.setAttribute('aria-label', 'Copied'); setTimeout(() => { copy.classList.remove('is-done'); copy.setAttribute('aria-label', 'Copy the request'); }, 1400); } catch (e) {}
  });

})();
