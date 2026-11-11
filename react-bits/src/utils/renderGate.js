export function createRenderGate(el, { onStart, onStop, rootMargin = '150px' } = {}) {
  let inView = false;
  let tabVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
  let running = false;

  const sync = () => {
    const next = inView && tabVisible;
    if (next === running) return;
    running = next;
    if (next) onStart?.();
    else onStop?.();
  };

  let observer = null;
  if (el && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      entries => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin }
    );
    observer.observe(el);
  } else {
    inView = true;
    sync();
  }

  const onVisibilityChange = () => {
    tabVisible = document.visibilityState !== 'hidden';
    sync();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (running) {
      running = false;
      onStop?.();
    }
  };
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}
