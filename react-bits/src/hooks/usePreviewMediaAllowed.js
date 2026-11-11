import { useEffect, useState } from 'react';

const DESKTOP_POINTER_QUERY = '(min-width: 968px) and (hover: hover) and (pointer: fine)';

const getPreference = () => {
  if (typeof window === 'undefined') return false;

  const precisePointer = window.matchMedia(DESKTOP_POINTER_QUERY).matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrainedConnection = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);

  return precisePointer && !reducedMotion && !constrainedConnection;
};

const usePreviewMediaAllowed = () => {
  const [allowed, setAllowed] = useState(getPreference);

  useEffect(() => {
    const pointerQuery = window.matchMedia(DESKTOP_POINTER_QUERY);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const update = () => setAllowed(getPreference());

    pointerQuery.addEventListener?.('change', update);
    motionQuery.addEventListener?.('change', update);
    connection?.addEventListener?.('change', update);
    update();

    return () => {
      pointerQuery.removeEventListener?.('change', update);
      motionQuery.removeEventListener?.('change', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);

  return allowed;
};

export default usePreviewMediaAllowed;
