import { useEffect, useMemo, useState } from 'react';

const CATALOG_KEY = 'reactbits:index-catalog';
const SESSION_KEY = 'reactbits:index-new-this-visit';

const readList = (storage, key) => {
  try {
    const value = JSON.parse(storage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const useNewSinceLastVisit = keys => {
  const currentKeys = useMemo(() => [...keys].sort(), [keys]);
  const [newKeys] = useState(() => {
    if (typeof window === 'undefined') return new Set();

    const sessionKeys = readList(window.sessionStorage, SESSION_KEY);
    if (sessionKeys.length > 0) return new Set(sessionKeys);

    const previousKeys = readList(window.localStorage, CATALOG_KEY);
    if (previousKeys.length === 0) return new Set();

    const previous = new Set(previousKeys);
    const discovered = currentKeys.filter(key => !previous.has(key));
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(discovered));
    } catch {
      return new Set(discovered);
    }
    return new Set(discovered);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(CATALOG_KEY, JSON.stringify(currentKeys));
    } catch {
      return;
    }
  }, [currentKeys]);

  return newKeys;
};

export default useNewSinceLastVisit;
