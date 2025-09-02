'use client';

import { useState } from 'react';
import { AuthForm } from './auth-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const { user } = useAuth();

  // Close modal if user is authenticated
  if (user) {
    onClose();
    return null;
  }

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleError = (error: string) => {
    // You could show a toast notification here
    console.error('Auth error:', error);
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>

          <AuthForm
            mode={mode}
            onSuccess={handleSuccess}
            onError={handleError}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                className="text-secondary hover:text-secondary/80 font-medium"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
