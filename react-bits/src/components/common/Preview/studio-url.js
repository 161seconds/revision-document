export function buildStudioUrl(backgroundId, currentProps = {}, defaultProps = {}) {
  const params = new URLSearchParams();
  params.set('bg', backgroundId);

  Object.keys(currentProps).forEach(key => {
    if (JSON.stringify(currentProps[key]) !== JSON.stringify(defaultProps[key])) {
      const value = currentProps[key];
      if (Array.isArray(value)) {
        params.set(key, value.map(v => (typeof v === 'string' ? v.replace(/^#/, '') : v)).join(','));
      } else if (typeof value === 'string' && value.startsWith('#')) {
        params.set(key, value.replace(/^#/, ''));
      } else {
        params.set(key, String(value));
      }
    }
  });

  return `/tools/background-studio?${params.toString()}`;
}
