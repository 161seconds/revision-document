// Long Meadow: the sun sets on arrival; the order counts bottles.
(() => {
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector('.hero').classList.add('is-ready')));
  const out = document.querySelector('[data-qty]'), total = document.querySelector('[data-total]');
  let n = 2;
  document.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
    n = Math.max(1, Math.min(12, n + +b.dataset.q));
    out.textContent = n;
    total.textContent = `Order ${n} ${n === 1 ? 'bottle' : 'bottles'}, £${n * 16}`;
  }));
})();
