import { useContext } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import CustomizeActionsContext from './CustomizeContext';

const Customize = ({ children }) => {
  const actions = useContext(CustomizeActionsContext);

  return (
    <div className="customize-frame">
      <div className="customize-heading">
        <h2>Customize</h2>
        <div className="customize-heading-actions">
          {actions?.reset && (
            <button
              type="button"
              className={`customize-heading-action customize-reset-action${actions.canReset ? ' is-visible' : ''}`}
              onClick={actions.reset}
              disabled={!actions.canReset}
              aria-hidden={!actions.canReset}
              tabIndex={actions.canReset ? 0 : -1}
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
          {actions?.openStudio && (
            <button type="button" className="customize-heading-action" onClick={actions.openStudio}>
              <Palette size={14} aria-hidden="true" />
              <span>Open in BG Studio</span>
            </button>
          )}
        </div>
      </div>

      <div className="preview-options">{children}</div>
    </div>
  );
};

export default Customize;
