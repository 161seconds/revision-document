import { useEffect } from 'react';

export default function usePauseOffscreenAnimations(
  enabled = true,
  selector = '.landing-wrapper section, .landing-wrapper footer'
) {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;

    const elements = Array.from(document.querySelectorAll(selector));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          entry.target.classList.toggle('ln-anim-paused', !entry.isIntersecting);
        }
      },
      { rootMargin: '100px' }
    );
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      elements.forEach(el => el.classList.remove('ln-anim-paused'));
    };
  }, [enabled, selector]);
}
