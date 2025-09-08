'use client';

import { useState } from 'react';
import { AuthForm } from './auth-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface SignInCardProps {
  onSuccess?: () => void;
}

export function SignInCard({ onSuccess }: SignInCardProps = {}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      // Default behavior: redirect to arcade after successful auth
      window.location.href = '/arcade';
    }
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <Card className="w-full border-border bg-card">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-foreground">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {mode === 'signin' 
            ? 'Welcome back to Mystic Arcade' 
            : 'Join the Mystic Arcade adventure'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Auth Form */}
        <AuthForm
          mode={mode}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Toggle Mode */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={toggleMode}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center pt-2">
          <Link 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
