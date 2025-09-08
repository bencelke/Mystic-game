'use client';

import { ReactNode } from 'react';

interface AriaLiveProps {
  children: ReactNode;
  level?: 'polite' | 'assertive';
  className?: string;
}

export function AriaLive({ children, level = 'polite', className = '' }: AriaLiveProps) {
  return (
    <div 
      aria-live={level} 
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}
