let initialised = false;

export function initInputModeTracking() {
  if (initialised || typeof document === 'undefined') return;
  initialised = true;

  const root = document.documentElement;
  const set = mode => {
    if (root.dataset.inputMode !== mode) root.dataset.inputMode = mode;
  };

  set('pointer');

  const NAV_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ']);

  window.addEventListener(
    'keydown',
    e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (NAV_KEYS.has(e.key)) set('keyboard');
    },
    true
  );

  window.addEventListener('pointerdown', () => set('pointer'), true);
}
