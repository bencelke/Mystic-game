import { useState, useEffect } from 'react';

// Storage key for local Pro status
const PRO_STORAGE_KEY = 'mystic:pro';

// Helper to safely access localStorage
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

// Get current Pro status from localStorage
export function getLocalPro(): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const stored = storage.getItem(PRO_STORAGE_KEY);
    if (stored === null) return false;
    return JSON.parse(stored) === true;
  } catch (error) {
    console.error('Error parsing Pro status:', error);
    return false;
  }
}

// Set Pro status in localStorage
export function setLocalPro(value: boolean): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(PRO_STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving Pro status:', error);
  }
}

// React hook for Pro status (client-only)
export function useLocalPro(): [boolean, (value: boolean) => void] {
  const [pro, setProState] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setProState(getLocalPro());
  }, []);

  // Update function that persists to localStorage
  const setPro = (value: boolean) => {
    setProState(value);
    setLocalPro(value);
  };

  return [pro, setPro];
}
