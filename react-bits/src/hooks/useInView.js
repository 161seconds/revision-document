import { useEffect, useRef, useState } from 'react';

export default function useInView(rootMargin = '150px') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    let inView = false;
    let tabVisible = document.visibilityState !== 'hidden';
    const sync = () => setVisible(inView && tabVisible);

    const observer = new IntersectionObserver(
      entries => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin }
    );
    observer.observe(el);

    const onVisibilityChange = () => {
      tabVisible = document.visibilityState !== 'hidden';
      sync();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [rootMargin]);

  return [ref, visible];
}
