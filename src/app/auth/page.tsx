'use client';

import { SignInCard } from '@/components/auth';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-y-auto bg-background text-foreground">
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
