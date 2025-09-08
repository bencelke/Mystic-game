'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './context';

interface AuthGateState {
  isOpen: boolean;
  pendingResolve: (() => void) | null;
}

export function useAuthGate() {
  const { user, loading } = useAuth();
  const [state, setState] = useState<AuthGateState>({
    isOpen: false,
    pendingResolve: null,
  });

  const ensureAuthed = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (user && !loading) {
        resolve();
        return;
      }

      if (loading) {
        const checkAuth = () => {
          if (!loading) {
            if (user) {
              resolve();
            } else {
              setState({
                isOpen: true,
                pendingResolve: resolve,
              });
            }
          } else {
            setTimeout(checkAuth, 100);
          }
        };
        checkAuth();
        return;
      }

      setState({
        isOpen: true,
        pendingResolve: resolve,
      });
    });
  }, [user, loading]);

  const handleOpenChange = useCallback((open: boolean) => {
    setState(prev => ({
      ...prev,
      isOpen: open,
    }));
  }, []);

  const handleAuthenticated = useCallback(() => {
    setState(prev => {
      if (prev.pendingResolve) {
        prev.pendingResolve();
      }
      return {
        isOpen: false,
        pendingResolve: null,
      };
    });
  }, []);

  useEffect(() => {
    if (user && state.isOpen && state.pendingResolve) {
      handleAuthenticated();
    }
  }, [user, state.isOpen, state.pendingResolve, handleAuthenticated]);

  return {
    ensureAuthed,
    isOpen: state.isOpen,
    onOpenChange: handleOpenChange,
    onAuthenticated: handleAuthenticated,
  };
}