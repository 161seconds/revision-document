import { useEffect } from 'react';

const useScrollToTop = () => {
  useEffect(() => {
    // Honor a #hash target if one is present (e.g. /sponsors#sponsor-plans),
    // otherwise scroll to the top.
    const hash = window.location.hash;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView();
      return;
    }
    // Keep the body in a block statement: `window.scrollTo` may return a
    // Promise in newer browsers, and returning it from the effect would make
    // React call it as a cleanup function on unmount and crash.
    window.scrollTo(0, 0);
  }, []);
};

export default useScrollToTop;
