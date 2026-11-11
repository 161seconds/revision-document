import { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import '../../../css/preview-slider.css';

const LABEL_OVERRIDES = { pingpong: 'Ping Pong', rotate3d: 'Rotate 3D' };
const formatOptionLabel = str => LABEL_OVERRIDES[str] ?? str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const PreviewSelect = ({ title = '', options = [], value = '', isDisabled = false, onChange }) => {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);

  const formattedOptions = useMemo(
    () =>
      options.map(opt =>
        typeof opt === 'string'
          ? { value: opt, label: formatOptionLabel(opt) }
          : typeof opt === 'object' && opt !== null
            ? { ...opt, label: opt.label != null ? opt.label : formatOptionLabel(opt.value) }
            : { value: String(opt), label: String(opt) }
      ),
    [options]
  );

  const labelMap = useMemo(
    () =>
      formattedOptions.reduce((map, opt) => {
        map[opt.value] = opt.label;
        return map;
      }, {}),
    [formattedOptions]
  );

  useEffect(() => {
    if (!open) return;
    const onClick = e => {
      const inTrigger = wrapRef.current && wrapRef.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener('pointerdown', onClick);
    return () => document.removeEventListener('pointerdown', onClick);
  }, [open]);

  // Keep the portaled dropdown anchored to the trigger so it never gets clipped
  // by a scrollable or overflow-hidden ancestor panel.
  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (!wrapRef.current) return;
      setRect(wrapRef.current.getBoundingClientRect());
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  return (
    <div className="scrubber" ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="scrubber-track scrubber-track--select"
        aria-label={title}
        aria-disabled={isDisabled}
        data-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => !isDisabled && setOpen(o => !o)}
      >
        <span className="scrubber-label">{title}</span>
        <span className="scrubber-select-right">
          <span className="scrubber-value">{labelMap[value] || value}</span>
          <svg
            className={`scrubber-caret${open ? ' scrubber-caret--open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            className="scrubber-dropdown"
            style={{
              position: 'fixed',
              top: rect.bottom + 4,
              left: rect.left,
              right: 'auto',
              width: rect.width,
              zIndex: 9999
            }}
          >
            {formattedOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`scrubber-dropdown-item${opt.value === value ? ' scrubber-dropdown-item--active' : ''}`}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default PreviewSelect;
