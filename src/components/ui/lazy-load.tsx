'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoad({ children, fallback }: LazyLoadProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    // Skip lazy loading for reduced motion users to avoid layout shifts
    return <>{children}</>;
  }

  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-card rounded-lg h-32" />}>
      {children}
    </Suspense>
  );
}

// Lazy load heavy components
export const LazyCompatibilityPanel = lazy(() => 
  import('@/components/numerology/compatibility-panel').then(module => ({ 
    default: module.CompatibilityPanel 
  }))
);

export const LazyDeepReadingPanel = lazy(() => 
  import('@/components/numerology/deep-reading-panel').then(module => ({ 
    default: module.DeepReadingPanel 
  }))
);
