import { useMemo } from 'react';

import { useColorMode } from '../components/setup/color-mode';

const valuesMatch = (value, defaultValue) => {
  if (Object.is(value, defaultValue)) return true;
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return JSON.stringify(value) === JSON.stringify(defaultValue);
  }
  return false;
};

const useThemedProps = (props, defaultProps, lightProps = {}, darkProps = {}) => {
  const { colorMode } = useColorMode();

  return useMemo(() => {
    const themeProps = colorMode === 'light' ? lightProps : darkProps;

    return Object.fromEntries(
      Object.entries(props).map(([name, value]) => [
        name,
        Object.prototype.hasOwnProperty.call(themeProps, name) && valuesMatch(value, defaultProps[name])
          ? themeProps[name]
          : value
      ])
    );
  }, [colorMode, darkProps, defaultProps, lightProps, props]);
};

export default useThemedProps;
