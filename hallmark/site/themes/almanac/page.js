// Tidetable chart: a modelled tide (a 12.42-hour wave whose range swells and shrinks over a 14.77-day spring-neap
// cycle) and a computed sun (declination from the day, hour angle from the port's latitude). Labelled as an
// example on the page: it shows the parts of a table, not a forecast.
(() => {
  const PORTS = [{ lat: 50.15, mean: 2.9, range: 4.2, lag: 3.1 }, { lat: 54.49, mean: 3.1, range: 4.6, lag: 5.4 }, { lat: 60.15, mean: 1.2, range: 1.6, lag: 9.2 }];
  const SEMI = 12.42, SPRING = 14.77;
  const height = (p, day, h) => {
    const s = 0.62 + 0.38 * Math.cos(2 * Math.PI * (day - 4) / SPRING);
    return p.mean + (p.range / 2) * s * Math.cos(2 * Math.PI * (h - p.lag - day * 0.84) / SEMI);
  };
  const sun = (lat, day) => {
    const dec = -23.44 * Math.cos(2 * Math.PI * (day + 10) / 365) * Math.PI / 180, L = lat * Math.PI / 180;
    const h0 = -0.833 * Math.PI / 180;
    const cosw = (Math.sin(h0) - Math.sin(L) * Math.sin(dec)) / (Math.cos(L) * Math.cos(dec));
    const w = Math.acos(Math.max(-1, Math.min(1, cosw))) * 180 / Math.PI / 15;
    const noon = 12.2 + (day > 88 && day < 302 ? 1 : 0);
    return [noon - w, noon + w];
  };
  const hhmm = (h) => { h = ((h % 24) + 24) % 24; const m = Math.round(h * 60); return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dateOf = (d) => { let m = 0; while (d >= DAYS[m]) d -= DAYS[m++]; return `${d + 1} ${MONTHS[m]}`; };

  // a day
  const plot = document.querySelector('[data-plot]');
  const read = document.querySelector('[data-read]');
  const dateEl = document.querySelector('[data-date]');
  const slider = document.querySelector('[data-day]');
  let port = 0;
  const draw = () => {
    const p = PORTS[port], day = +slider.value;
    dateEl.textContent = dateOf(day);
    const W = 1000, H = 300, X = (h) => h / 24 * W, Y = (m) => H - 20 - m / 6.5 * (H - 40);
    const [rise, set] = sun(p.lat, day);
    let d = '';
    const pts = [];
    for (let i = 0; i <= 288; i++) { const h = i / 12; const m = height(p, day, h); pts.push([h, m]); d += (i ? ' L' : 'M') + X(h).toFixed(1) + ' ' + Y(m).toFixed(1); }
    // highs and lows: turning points of the curve
    const turns = [];
    for (let i = 1; i < pts.length - 1; i++) {
      const [a, b, c] = [pts[i - 1][1], pts[i][1], pts[i + 1][1]];
      if ((b > a && b >= c) || (b < a && b <= c)) turns.push({ h: pts[i][0], m: b, hi: b > a });
    }
    let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart__svg" role="img" aria-label="Chart: the tide through ${dateOf(day)}, with the night shaded">`;
    svg += `<rect class="c-night" x="0" y="0" width="${X(rise)}" height="${H - 20}"/><rect class="c-night" x="${X(set)}" y="0" width="${W - X(set)}" height="${H - 20}"/>`;
    for (let m = 0; m <= 6; m += 2) svg += `<line class="c-grid" x1="0" x2="${W}" y1="${Y(m)}" y2="${Y(m)}" vector-effect="non-scaling-stroke"/>`;
    svg += `<line class="c-sun" x1="${X(rise)}" x2="${X(rise)}" y1="0" y2="${H - 20}" vector-effect="non-scaling-stroke"/><line class="c-sun" x1="${X(set)}" x2="${X(set)}" y1="0" y2="${H - 20}" vector-effect="non-scaling-stroke"/>`;
    svg += `<path class="c-fill" d="${d} L${W} ${H - 20} L0 ${H - 20} Z"/><path class="c-series" d="${d}" vector-effect="non-scaling-stroke"/>`;
    turns.forEach((t) => { svg += `<circle class="c-turn" cx="${X(t.h)}" cy="${Y(t.m)}" r="5"/>`; });
    svg += `</svg>`;
    const edge = (h) => (h < 3 ? ' is-start' : h > 21 ? ' is-end' : '');
    let labels = '';
    turns.forEach((t) => { labels += `<span class="tag ${t.hi ? 'tag--hi' : 'tag--lo'}${edge(t.h)}" style="left:${t.h / 24 * 100}%;top:${Y(t.m) / H * 100}%">${t.hi ? 'High' : 'Low'} ${hhmm(t.h)}, ${t.m.toFixed(1)} m</span>`; });
    labels += `<span class="tag tag--sun${edge(rise)}" style="left:${rise / 24 * 100}%">Sunrise ${hhmm(rise)}</span><span class="tag tag--sun${edge(set)}" style="left:${set / 24 * 100}%">Sunset ${hhmm(set)}</span>`;
    labels += `<div class="axis">${[0, 6, 12, 18, 24].map((h) => `<span style="left:${h / 24 * 100}%">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>`;
    plot.innerHTML = svg + labels;
    const items = turns.slice(0, 4).map((t) => [t.hi ? 'High water' : 'Low water', `${hhmm(t.h)}`]);
    items.push(['Sunrise', hhmm(rise)], ['Sunset', hhmm(set)]);
    read.innerHTML = items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  };
  slider.addEventListener('input', draw);
  document.querySelectorAll('[data-port]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-port]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    port = +b.dataset.port; draw();
  }));
  draw();

})();
