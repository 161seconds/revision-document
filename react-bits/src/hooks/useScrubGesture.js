import { useCallback, useRef, useState } from 'react';

// How far a touch must travel before we decide what it meant.
const INTENT_THRESHOLD_PX = 6;

/**
 * Pointer handling shared by the scrubber controls.
 *
 * A mouse can claim the gesture on press, because a press is unambiguous. Touch cannot: the
 * customize panels are wall-to-wall control rows, so a scrubber that grabbed every touch
 * would leave the user with no way to scroll past it. Instead we stay out of the way until
 * the gesture proves itself horizontal, and let the browser pan the page otherwise. The
 * matching `touch-action: pan-y` in preview-slider.css is what hands vertical panning back
 * to the browser.
 */
export default function useScrubGesture({ trackRef, computeValue, onChange, isDisabled }) {
  const [isDragging, setIsDragging] = useState(false);
  // Mirrors isDragging so a move landing in the same tick as the state update isn't dropped.
  const draggingRef = useRef(false);
  // A touch we've seen but not yet claimed.
  const pendingRef = useRef(null);

  const begin = useCallback(
    (e) => {
      draggingRef.current = true;
      setIsDragging(true);
      trackRef.current?.setPointerCapture(e.pointerId);
      onChange?.(computeValue(e.clientX));
    },
    [trackRef, computeValue, onChange]
  );

  const end = useCallback(() => {
    draggingRef.current = false;
    pendingRef.current = null;
    setIsDragging(false);
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (isDisabled) return;
      if (e.pointerType === 'touch') {
        pendingRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        return;
      }
      e.preventDefault();
      begin(e);
    },
    [isDisabled, begin]
  );

  const onPointerMove = useCallback(
    (e) => {
      const pending = pendingRef.current;
      if (pending) {
        if (e.pointerId !== pending.id) return;
        const dx = e.clientX - pending.x;
        const dy = e.clientY - pending.y;
        if (Math.abs(dx) < INTENT_THRESHOLD_PX && Math.abs(dy) < INTENT_THRESHOLD_PX) return;
        pendingRef.current = null;
        // Vertical intent belongs to the page, and we never claimed the pointer, so the
        // browser is already free to scroll with it.
        if (Math.abs(dy) >= Math.abs(dx)) return;
        begin(e);
        return;
      }
      if (!draggingRef.current) return;
      onChange?.(computeValue(e.clientX));
    },
    [begin, computeValue, onChange]
  );

  const onPointerUp = useCallback(
    (e) => {
      // A touch that lifted before showing any intent is a tap, which sets the value just
      // like the press-to-jump a mouse gets.
      if (pendingRef.current?.id === e.pointerId) onChange?.(computeValue(e.clientX));
      end();
    },
    [computeValue, onChange, end]
  );

  // Fired when the browser takes the gesture over to scroll the page.
  const onPointerCancel = useCallback(() => end(), [end]);

  return { isDragging, onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
