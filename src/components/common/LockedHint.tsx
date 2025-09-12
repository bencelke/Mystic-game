'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LockedHintProps {
  title: string;
  message: string;
  ctaLabel: string;
  href: string;
  className?: string;
}

export function LockedHint({ 
  title, 
  message, 
  ctaLabel, 
  href, 
  className 
}: LockedHintProps) {
  return (
    <Card className={`border-border bg-card ${className}`}>
      <CardContent className="text-center py-8">
        <div className="space-y-4">
          <div className="text-4xl">🔒</div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {message}
            </p>
          </div>
          
          <Link href={href}>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
