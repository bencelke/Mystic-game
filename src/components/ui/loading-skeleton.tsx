'use client';

import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface LoadingSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSkeleton({ className = '', children }: LoadingSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return (
      <div className={`bg-card border border-border rounded-lg ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`animate-pulse bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <LoadingSkeleton className="p-6">
      <div className="space-y-4">
        <div className="h-4 bg-border rounded w-3/4"></div>
        <div className="h-4 bg-border rounded w-1/2"></div>
        <div className="h-4 bg-border rounded w-5/6"></div>
      </div>
    </LoadingSkeleton>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
      {Array.from({ length: count }, (_, i) => (
        <LoadingSkeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}
