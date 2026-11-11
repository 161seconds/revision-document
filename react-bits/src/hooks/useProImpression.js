import { useEffect, useRef } from 'react';
import { trackProImpression } from '../utils/pro';

/**
 * Tracks a Pro placement once it is meaningfully visible. The element ref can
 * be attached to a card, CTA or fixed bar; each mounted placement fires once.
 */
const useProImpression = (placement, params = {}, enabled = true) => {
  const ref = useRef(null);
  const paramsRef = useRef(params);
  const trackedRef = useRef(false);

  paramsRef.current = params;

  useEffect(() => {
    if (!enabled || trackedRef.current) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    const track = () => {
      if (trackedRef.current) return;
      trackedRef.current = true;
      trackProImpression(placement, paramsRef.current);
    };

    if (typeof IntersectionObserver !== 'function') {
      track();
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.4)) {
          track();
          observer.disconnect();
        }
      },
      { threshold: [0.4] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, placement]);

  return ref;
};

export default useProImpression;
