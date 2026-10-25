// Halyard: the poster's guides sit on the word's real metrics; the tester is the one thing to try.
(() => {
  const hero = document.querySelector('.hero__poster');
  const word = hero.querySelector('[data-word]');
  const lines = { cap: hero.querySelector('.metric--cap'), x: hero.querySelector('.metric--x'), base: hero.querySelector('.metric--base'), desc: hero.querySelector('.metric--desc') };
  const place = () => {
    const fs = parseFloat(getComputedStyle(word).fontSize);
    const cx = document.createElement('canvas').getContext('2d');
    cx.font = `400 ${fs}px "Bodoni Moda"`;
    const m = (s) => cx.measureText(s);
    const mark = document.createElement('span');
    mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    word.append(mark);
    const base = word.offsetTop + mark.offsetTop;
    mark.remove();
    lines.base.style.top = base + 'px';
    lines.cap.style.top = base - m('H').actualBoundingBoxAscent + 'px';
    lines.x.style.top = base - m('x').actualBoundingBoxAscent + 'px';
    lines.desc.style.top = base + m('y').actualBoundingBoxDescent + 'px';
    hero.classList.add('is-placed');
  };
  document.fonts.ready.then(place);
  addEventListener('resize', place);

  const text = document.querySelector('[data-tester]');
  const outs = { size: document.querySelector('[data-out="size"]'), weight: document.querySelector('[data-out="weight"]') };
  document.querySelectorAll('[data-ctl]').forEach((r) => r.addEventListener('input', () => {
    if (r.dataset.ctl === 'size') { text.style.setProperty('--size', r.value + 'px'); outs.size.textContent = r.value; }
    else { text.style.setProperty('--wt', r.value); outs.weight.textContent = r.value; }
  }));
  document.querySelectorAll('[data-style]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-style]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    text.style.setProperty('--st', b.dataset.style);
  }));
})();
