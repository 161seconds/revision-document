// Share of the viewport that raster images paint, measured from rendered boxes.
// Counts <img> (any source, data URIs included), <video>, <input type=image>,
// SVG <image>, and elements or ::before/::after pseudo-elements that paint a
// url() image (background, border, mask, list marker or generated content).
// Gradients and same-document fragment references (url(#mask), a pattern or
// mask drawn in SVG) are code and do not count, unless the definition they name
// holds raster content: an <image>, <feImage> or url() raster anywhere inside
// it, followed through nested fragment references and hrefs. An <image> inside
// a definition has no rendered box, so the element that references such a
// definition counts instead: through mask, clip-path, fill or use at its box
// (a use also through the fill and stroke it passes to its clones), through
// stroke at its box widened by half the screen stroke width, through filter at
// the filter region (the viewport when a region length cannot be resolved), and
// an inner SVG element through filter or a marker at its outermost <svg>. A no-repeat background with an explicit pixel size counts at
// that size; object-fit contain/scale-down counts the letterboxed picture, not
// its box. Every box is clipped by the ancestors that clip it (overflow or
// contain: paint on its containing-block chain), and an element under an
// ancestor with opacity 0 paints nothing. The union is taken on a 4px grid so
// tiled or overlapping pieces add up once.
//
// `exclude` (optional) is what a spec with raster regions declares: `boxes`
// are the regions' viewport rectangles, whose grid cells (by cell centre) are
// left out of the count, and `paths` are the declared plates (project paths),
// whose images are not counted at all. A piece reached through an SVG
// definition is never treated as a declared plate. With neither, every image
// counts. `pseudos` are the native layout boxes of the generated
// ::before/::after boxes (`native_pseudo_boxes` over CDP), where each counts.
(exclude, pseudos) => {
  const W = innerWidth, H = innerHeight, cell = 4;
  const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
  const grid = new Uint8Array(cols * rows);
  const items = [];
  const page = location.href.split('#')[0];
  const boxes = (exclude && exclude.boxes) || [];
  // Native layout boxes of generated ::before/::after, by host index in
  // querySelectorAll order and pseudo name (`{index, pseudo, box}`).
  const native = new Map((pseudos || []).filter(q => q.box).map(q => [q.index + q.pseudo, q.box]));
  // A resource is named by origin and path: the snapshot server ignores the
  // query string, and a fragment never reaches it, so `art.png?v=2` is the plate.
  const resource = u => u.origin + u.pathname;
  const plates = new Set(((exclude && exclude.paths) || []).map(p => resource(new URL(p, location.origin + '/'))));
  const outside = (x, y) => !boxes.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  const refs = v => typeof v === 'string' ? [...v.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)].map(m => m[2]) : [];
  // The id a same-document fragment reference names, or null for any other
  // reference. Chromium may report url(#id) resolved against the page URL.
  const fragment = ref => {
    let hash = ref.startsWith('#') ? ref : null;
    if (hash == null) {
      try {
        const u = new URL(ref, page);
        if (u.hash && u.href.split('#')[0] === page) hash = u.hash;
      } catch { /* an unparsable reference is counted, never waived */ }
    }
    if (hash == null) return null;
    try { return decodeURIComponent(hash.slice(1)); } catch { return hash.slice(1); }
  };
  // Properties through which an element, or a node inside a definition, can
  // reach an image or another definition.
  const REFS = ['fill', 'stroke', 'maskImage', 'webkitMaskImage', 'filter', 'clipPath', 'markerStart', 'markerMid', 'markerEnd',
    'backgroundImage', 'borderImageSource', 'listStyleImage', 'content'];
  const href = n => n.getAttribute('href') ?? n.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
  const defs = new Map();
  // True when the definition an id names holds raster content: an <image>,
  // <feImage>, <img>, <video> or <input type=image> anywhere inside it, an href
  // or url() that leaves the document, or a fragment reference to another
  // definition that holds raster content. Each query walks the references
  // depth first with its own visited set, so a cycle adds nothing and cannot
  // hide raster content further along it; only whole answers are cached.
  const rasterDef = (id, seen) => {
    const el = document.getElementById(id);
    if (!el) return false;
    if (defs.has(el)) return defs.get(el);
    const top = !seen;
    seen ??= new Set();
    if (seen.has(el)) return false;
    seen.add(el);
    const found = [el, ...el.querySelectorAll('*')].some(n => {
      const tag = n.localName.toLowerCase();
      if (['image', 'feimage', 'img', 'video'].includes(tag) || (tag === 'input' && n.type === 'image')) return true;
      const h = n instanceof SVGElement ? href(n) : null;
      if (h && (fragment(h) == null || rasterDef(fragment(h), seen))) return true;
      const s = getComputedStyle(n);
      return REFS.some(p => url(s[p], seen));
    });
    if (top) defs.set(el, found);
    return found;
  };
  // True when the value references at least one image: a reference that is not
  // a fragment of this document, or a fragment naming a definition that holds
  // raster content. A fragment naming a vector definition is code.
  const url = (v, seen) => refs(v).some(ref => {
    const id = fragment(ref);
    return id == null || rasterDef(id, seen);
  });
  // The images a value draws from, for matching against declared plates: each
  // reference that leaves the document as its resource, an unparsable one or a
  // fragment naming a raster definition as null (never a declared plate), and a
  // fragment naming a vector definition not at all.
  const srcsOf = v => refs(v).flatMap(ref => {
    const id = fragment(ref);
    if (id != null) return rasterDef(id) ? [null] : [];
    try { return [resource(new URL(ref, page))]; } catch { return [null]; }
  });
  // A piece drawn only from declared plates is the spec's own raster.
  const declared = srcs => plates.size > 0 && srcs.length > 0 && srcs.every(u => u && plates.has(u));
  const px = v => /^-?[\d.]+px$/.test(v) ? parseFloat(v) : null;
  const intersect = (a, b) => ({ left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) });
  const createsFixedBlock = s => s.transform !== 'none' || s.perspective !== 'none' || s.filter !== 'none'
    || /transform|perspective|filter/.test(s.willChange) || /paint|layout|strict|content/.test(s.contain);
  const clips = s => s.overflowX !== 'visible' || s.overflowY !== 'visible' || /paint|strict|content/.test(s.contain);
  // Clip by the ancestors that actually clip the box: an absolutely positioned
  // box escapes overflow below its containing block, and a fixed one escapes
  // everything but a transform-like containing block. Never clip by an ancestor
  // that does not contain the box, or a hidden-overflow wrapper would let a
  // full-viewport image through.
  const clipped = (from, mode, r) => {
    for (let a = from; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      const contains = mode === 'fixed' ? createsFixedBlock(s)
        : mode === 'absolute' ? (s.position !== 'static' || createsFixedBlock(s)) : true;
      if (!contains) continue;
      if (clips(s)) {
        const b = a.getBoundingClientRect();
        r = intersect(r, { left: b.left + a.clientLeft, top: b.top + a.clientTop, right: b.left + a.clientLeft + a.clientWidth, bottom: b.top + a.clientTop + a.clientHeight });
      }
      mode = s.position === 'fixed' || s.position === 'absolute' ? s.position : 'static';
    }
    return r;
  };
  const transparent = el => {
    for (let a = el; a; a = a.parentElement) if (parseFloat(getComputedStyle(a).opacity) === 0) return true;
    return false;
  };
  const mark = (from, mode, r, what, srcs) => {
    if (srcs && declared(srcs)) return;
    r = intersect(clipped(from, mode, r), { left: 0, top: 0, right: W, bottom: H });
    if (r.right <= r.left || r.bottom <= r.top) return;
    let own = 0;
    for (let y = Math.floor(r.top / cell); y < Math.ceil(r.bottom / cell); y++)
      for (let x = Math.floor(r.left / cell); x < Math.ceil(r.right / cell); x++) {
        if (!outside((x + 0.5) * cell, (y + 0.5) * cell)) continue;
        grid[y * cols + x] = 1;
        own++;
      }
    if (!own) return;
    // Without exclusion boxes a piece's share is its painted area; with them,
    // the share of the viewport it paints outside the declared regions.
    const share = boxes.length ? own / (cols * rows) : (r.right - r.left) * (r.bottom - r.top) / (W * H);
    items.push({ what, box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top) }, share });
  };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  const box = r => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
  const background = (s, r) => {
    const size = (s.backgroundSize || '').split(' ').map(px);
    const norepeat = /^no-repeat( no-repeat)?$/.test(s.backgroundRepeat || '');
    if (norepeat && size.length === 2 && size[0] != null && size[1] != null) {
      const [x, y] = (s.backgroundPosition || '0px 0px').split(' ').map(v => px(v) ?? 0);
      return { left: r.left + x, top: r.top + y, right: r.left + x + size[0], bottom: r.top + y + size[1] };
    }
    return box(r);
  };
  // The painted picture of a replaced element: object-fit contain and
  // scale-down letterbox it inside the content box.
  const picture = (el, s, r) => {
    const c = { left: r.left + (px(s.borderLeftWidth) ?? 0) + (px(s.paddingLeft) ?? 0), top: r.top + (px(s.borderTopWidth) ?? 0) + (px(s.paddingTop) ?? 0),
      right: r.right - (px(s.borderRightWidth) ?? 0) - (px(s.paddingRight) ?? 0), bottom: r.bottom - (px(s.borderBottomWidth) ?? 0) - (px(s.paddingBottom) ?? 0) };
    const nw = el.naturalWidth || el.videoWidth || 0, nh = el.naturalHeight || el.videoHeight || 0;
    if (!['contain', 'scale-down'].includes(s.objectFit) || !nw || !nh) return c;
    const cw = c.right - c.left, ch = c.bottom - c.top;
    let k = Math.min(cw / nw, ch / nh);
    if (s.objectFit === 'scale-down') k = Math.min(k, 1);
    const w = nw * k, h = nh * k;
    const [ox, oy] = (s.objectPosition || '50% 50%').split(' ');
    const at = (v, free) => v?.endsWith('%') ? free * parseFloat(v) / 100 : (px(v) ?? free / 2);
    const x = c.left + at(ox, cw - w), y = c.top + at(oy, ch - h);
    return { left: x, top: y, right: x + w, bottom: y + h };
  };
  // The outermost <svg> an SVG element draws in; its box bounds what a marker or
  // an inner element's filter can paint.
  const outer = el => { let o = el; while (o.ownerSVGElement) o = o.ownerSVGElement; return box(o.getBoundingClientRect()); };
  // The filter region of the first raster filter a filter value names, around
  // the box r (attributes x, y, width, height; -10%, -10%, 120%, 120% when
  // absent, in box fractions for objectBoundingBox units and in pixels from the
  // box corner for userSpaceOnUse). A length this cannot resolve exactly (a unit
  // such as in, mm or em, or a userSpaceOnUse percentage) counts the whole
  // viewport. Any other filter counts at the box.
  const region = (v, r) => {
    const id = refs(v).map(fragment).find(id => id != null && rasterDef(id));
    const f = id == null ? null : document.getElementById(id);
    if (!f || f.localName !== 'filter') return box(r);
    const user = f.getAttribute('filterUnits') === 'userSpaceOnUse';
    const viewport = { left: 0, top: 0, right: W, bottom: H };
    const len = (name, fallback, size) => {
      const raw = (f.getAttribute(name) ?? fallback).trim();
      const m = /^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(px|%)?$/i.exec(raw);
      if (!m || (m[2] === '%' && user) || (m[2] === 'px' && !user)) return null;
      const n = parseFloat(m[1]);
      return m[2] === '%' ? n / 100 * size : user ? n : n * size;
    };
    const w = r.right - r.left, h = r.bottom - r.top;
    const [x, y, fw, fh] = [len('x', '-10%', w), len('y', '-10%', h), len('width', '120%', w), len('height', '120%', h)];
    if ([x, y, fw, fh].some(n => n == null || !Number.isFinite(n))) return viewport;
    return fw > 0 && fh > 0 ? { left: r.left + x, top: r.top + y, right: r.left + x + fw, bottom: r.top + y + fh } : box(r);
  };
  // Half the painted stroke width in screen pixels: the CTM's largest singular
  // value bounds the stroke's widest direction, and a non-scaling stroke keeps
  // its own width.
  const halfStroke = (el, s) => {
    const m = s.vectorEffect === 'non-scaling-stroke' ? null : el.getScreenCTM?.();
    let k = 1;
    if (m) {
      const sum = m.a * m.a + m.b * m.b + m.c * m.c + m.d * m.d, det = m.a * m.d - m.b * m.c;
      k = Math.sqrt((sum + Math.sqrt(Math.max(0, sum * sum - 4 * det * det))) / 2);
    }
    return (px(s.strokeWidth) ?? 1) * k / 2;
  };
  for (const [index, el] of [...document.querySelectorAll('*')].entries()) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility !== 'visible' || transparent(el)) continue;
    const r = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const at = (rect, what, srcs) => mark(el.parentElement, s.position, rect, what, srcs);
    const src = v => { try { return v ? [resource(new URL(v, page))] : []; } catch { return [null]; } };
    if (tag === 'img' || tag === 'video' || (tag === 'input' && el.type === 'image')) at(picture(el, s, r), name(el), src(el.currentSrc || el.src));
    if (tag === 'image') at(box(r), name(el), src(el.href && el.href.baseVal));
    if (url(s.backgroundImage)) at(background(s, r), name(el) + ' background', srcsOf(s.backgroundImage));
    if (url(s.borderImageSource) || url(s.maskImage) || url(s.webkitMaskImage)) at(box(r), name(el) + ' border/mask image', [s.borderImageSource, s.maskImage, s.webkitMaskImage].flatMap(srcsOf));
    if (url(s.listStyleImage) && s.display === 'list-item') at(box(r), name(el) + ' list marker', srcsOf(s.listStyleImage));
    // SVG paint servers, clips, filters, markers and use references reach a
    // definition whose own <image> has no box, so this element's painted area
    // counts when that definition holds raster content. A vector definition
    // reads false and costs nothing. Content inside a definition paints only
    // through its referencing element, which is counted instead.
    if (el instanceof SVGElement && el.closest('defs,mask,pattern,clipPath,marker,symbol,filter')) continue;
    const inner = el instanceof SVGElement && !!el.ownerSVGElement;
    const shape = el instanceof SVGGeometryElement || el instanceof SVGTextContentElement;
    // A use paints its cloned shapes with the fill and stroke it passes down.
    const paints = shape || tag === 'use';
    if (url(s.clipPath)) at(box(r), name(el) + ' clip-path');
    if (paints && url(s.fill)) at(box(r), name(el) + ' fill');
    if (paints && url(s.stroke)) {
      const half = halfStroke(el, s);
      at({ left: r.left - half, top: r.top - half, right: r.right + half, bottom: r.bottom + half }, name(el) + ' stroke');
    }
    if (shape && (url(s.markerStart) || url(s.markerMid) || url(s.markerEnd))) at(outer(el), name(el) + ' marker');
    if (url(s.filter)) at(inner ? outer(el) : region(s.filter, r), name(el) + ' filter');
    const use = tag === 'use' ? href(el) : null;
    if (use && (fragment(use) == null || rasterDef(fragment(use)))) at(box(r), name(el) + ' href');
    for (const p of ['::before', '::after']) {
      const ps = getComputedStyle(el, p);
      if (!ps || ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || ps.visibility !== 'visible' || parseFloat(ps.opacity) === 0) continue;
      const own = url(ps.content) || url(ps.backgroundImage) || url(ps.borderImageSource) || url(ps.maskImage) || url(ps.webkitMaskImage) || url(ps.clipPath);
      const filtered = url(ps.filter);
      if (!own && !filtered) continue;
      // A pseudo-element has no client rect, so it counts at its native layout
      // box (the caller reads it over CDP; offsets, size and transforms all
      // applied). One with no layout box of its own (display: contents lays
      // its generated content out in the host's flow) counts the host box.
      // Its clipping chain starts at the host. A raster filter paints its
      // filter region around that box instead.
      const mode = ps.position === 'fixed' || ps.position === 'absolute' ? ps.position : 'static';
      const srcs = [ps.content, ps.backgroundImage, ps.borderImageSource, ps.maskImage, ps.webkitMaskImage, ps.clipPath].flatMap(srcsOf);
      const laid = native.get(index + p);
      const pr = laid ? { left: laid.x, top: laid.y, right: laid.x + laid.w, bottom: laid.y + laid.h } : box(r);
      if (own) mark(el, mode, pr, name(el) + p, srcs);
      if (filtered) mark(el, mode, region(ps.filter, pr), name(el) + p + ' filter');
    }
  }
  const covered = grid.reduce((n, v) => n + v, 0);
  items.sort((a, b) => b.share - a.share);
  const result = { share: covered / (cols * rows), cell, largest: items.slice(0, 5), measure: 'painted-box-union-v3' };
  if (exclude) result.excluded = { boxes, paths: exclude.paths || [] };
  return result;
}
