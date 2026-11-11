// --- browser-bundle/05-natives.js ---
// The JavaScript built-ins the page JS uses, held where page script cannot
// replace them. This code runs in the page's own world (the URL engine and
// the live /detect.js script), where a site may declare `var Map = ...` or
// assign `Array.from = ...` (work24.go.kr ships its own global `Map`, which
// failed every capture with `states.set is not a function`).
//
// The URL engine runs this file once more, as a script on every new document
// before any page script (`Page::initialize` in crates/browser), and that run
// stashes what it built on `window.__impeccableNatives`, read-only and
// non-enumerable. Later runs take the stash. Without one (the live script
// tag) the current globals are used as they are: live mode sees the user's
// own app.
//
// The extension does not ship this file: its content scripts already have
// their own globals, and in Firefox `window` there is an Xray view of the
// page's window, so natives built from it throw (crates/bundle EXT_SNAPSHOT).
// The builder reads `globalThis`, never `window`, for the same reason: in the
// page's own world the two are one object.
//
// `performance` is the page's own Performance object, shared with the page:
// a page that replaces the global is covered, one that assigns
// `performance.now` or patches `Performance.prototype` is not.
//
// The stash is page-visible: `Object.getOwnPropertyNames(window)` lists
// `__impeccableNatives` on every document the URL engine loads, and a page
// that declares its own global `let __impeccableNatives` fails to load that
// script. Both are vanishingly rare.
//
// The `const` at the end shadows the globals for everything after it in the
// same function scope, which every consumer of this file provides (the
// in-page bundle's IIFE, the URL engine's wrapper and prelude).
// Statics (`Array.from`, `JSON.stringify`, `Object.keys`, ...) are copied at
// capture time, so a later assignment to the shared object reaches nothing
// here. Prototype methods (`Map.prototype.set`) are not copied: a page that
// rewrites those is out of reach.
//
// The builder must reach every built-in through `g`, never by bare name:
// while it runs, the bare names are the `const` below, not yet initialized.

function __impeccableBuildNatives(g) {
  const O = g.Object;
  const R = g.Reflect;
  const freeze = O.freeze;
  // Held now, so a page that later replaces `Reflect.construct` or
  // `Reflect.apply` on the shared object cannot reach the facades below.
  const construct = R.construct;
  const apply = R.apply;
  // Own properties of `owner`, functions bound to it (`Array.from` and
  // `Promise.resolve` read `this`), onto `target`.
  const copyStatics = (owner, target) => {
    if (owner == null) return target;
    for (const name of O.getOwnPropertyNames(owner)) {
      if (name === 'length' || name === 'name' || name === 'prototype' || name === 'caller' || name === 'arguments') continue;
      let value;
      try { value = owner[name]; } catch { continue; }
      O.defineProperty(target, name, {
        value: typeof value === 'function' ? R.apply(g.Function.prototype.bind, value, [owner]) : value,
        enumerable: false, writable: false, configurable: false,
      });
    }
    return target;
  };
  const namespace = (owner) => (owner == null ? owner : freeze(copyStatics(owner, O.create(null))));
  // A constructor whose statics the page JS reads: calls and `new` reach the
  // native, `instanceof` still works, the statics are the copies.
  const callable = (native) => {
    if (typeof native !== 'function') return native;
    const facade = function (...args) {
      return new.target ? construct(native, args) : apply(native, undefined, args);
    };
    O.defineProperty(facade, 'prototype', { value: native.prototype, writable: false });
    return freeze(copyStatics(native, facade));
  };
  const bound = (name) => {
    const fn = g[name];
    return typeof fn === 'function' ? R.apply(g.Function.prototype.bind, fn, [g]) : undefined;
  };
  return freeze({
    // Constructors used for `new` or calls only, and objects whose methods
    // live on their prototype: the natives themselves.
    Map: g.Map, Set: g.Set, WeakMap: g.WeakMap, WeakSet: g.WeakSet,
    Error: g.Error, URL: g.URL, Image: g.Image, ResizeObserver: g.ResizeObserver,
    String: g.String, Boolean: g.Boolean,
    // Constructors whose statics are read.
    Array: callable(g.Array), Object: callable(g.Object), Number: callable(g.Number),
    Promise: callable(g.Promise),
    // Namespaces.
    JSON: namespace(g.JSON), Math: namespace(g.Math), Reflect: namespace(g.Reflect),
    CSS: namespace(g.CSS),
    // The page's own Performance object: its methods (`now`,
    // `getEntriesByType`, ...) live on its prototype, like Map's.
    performance: g.performance,
    // Window functions.
    getComputedStyle: bound('getComputedStyle'), matchMedia: bound('matchMedia'),
    setTimeout: bound('setTimeout'), clearTimeout: bound('clearTimeout'),
    requestAnimationFrame: bound('requestAnimationFrame'),
    // Global functions that do not read `this`.
    parseFloat: g.parseFloat,
  });
}

const __impeccableNatives = (() => {
  const g = globalThis;
  try {
    const stash = g.__impeccableNatives;
    if (stash && typeof stash === 'object') return stash;
  } catch { /* fall through */ }
  try { return __impeccableBuildNatives(g); } catch { /* fall through */ }
  return {
    Map: g.Map, Set: g.Set, WeakMap: g.WeakMap, WeakSet: g.WeakSet,
    Error: g.Error, URL: g.URL, Image: g.Image, ResizeObserver: g.ResizeObserver,
    String: g.String, Boolean: g.Boolean, Array: g.Array, Object: g.Object,
    Number: g.Number, Promise: g.Promise, JSON: g.JSON, Math: g.Math,
    Reflect: g.Reflect, CSS: g.CSS, performance: g.performance,
    getComputedStyle: g.getComputedStyle, matchMedia: g.matchMedia,
    setTimeout: g.setTimeout, clearTimeout: g.clearTimeout,
    requestAnimationFrame: g.requestAnimationFrame, parseFloat: g.parseFloat,
  };
})();

const {
  Map, Set, WeakMap, WeakSet, Error, URL, Image, ResizeObserver, String, Boolean,
  Array, Object, Number, Promise, JSON, Math, Reflect, CSS, performance,
  getComputedStyle, matchMedia, setTimeout, clearTimeout, requestAnimationFrame,
  parseFloat,
} = __impeccableNatives;
