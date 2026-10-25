// How it works: each panel plays its one move when the row arrives. The questions arrive, the three themes
// are dealt, the layout is drawn over three times, and the linter's findings are fixed one by one.
(function () {
  const how = document.querySelector('[data-how]');
  if (!how) return;
  const wire = how.querySelector('[data-wire]');
  const qs = [...how.querySelectorAll('.ask__qs li')];
  const issues = [...how.querySelectorAll('.lint__list li')];
  const ok = how.querySelector('.lint__ok');
  wire.dataset.l = '0';
  if (HM.reduce.matches || !('IntersectionObserver' in window)) { qs.forEach((q) => q.classList.add('is-on')); issues.forEach((i) => i.classList.add('is-fixed')); return; }
  how.classList.add('is-armed');

  let timer = 0, l = 0;
  const draw = () => { l = (l + 1) % 3; wire.dataset.l = String(l); };
  const play = () => {
    qs.forEach((q, i) => setTimeout(() => q.classList.add('is-on'), 200 + i * 260));
    setTimeout(() => how.classList.add('is-dealt'), 350);
    issues.forEach((it, i) => setTimeout(() => it.classList.add('is-fixed'), 700 + i * 380));
    setTimeout(() => ok.classList.add('is-on'), 700 + issues.length * 380);
    clearInterval(timer); timer = setInterval(draw, 1900);
  };
  const io = new IntersectionObserver((es) => {
    const e = es[0];
    if (e.isIntersecting) { if (!how.classList.contains('is-dealt')) play(); else { clearInterval(timer); timer = setInterval(draw, 1900); } }
    else clearInterval(timer);
  }, { threshold: 0.4 });
  io.observe(how);

  // the deal replays under the pointer
  const deal = how.querySelector('.how__art--deal');
  deal.addEventListener('pointerenter', () => { how.classList.remove('is-dealt'); setTimeout(() => how.classList.add('is-dealt'), 260); });
})();
