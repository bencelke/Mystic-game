'use client';

import { useAuth } from '@/lib/auth/context';
import { SignInCard } from './sign-in-card';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-4">Loading...</div>
          <div className="text-muted-foreground">Authenticating your mystical journey...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mystic Journey
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your daily rune ritual and mystical progression.
            </p>
          </div>
          
          <SignInCard />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
