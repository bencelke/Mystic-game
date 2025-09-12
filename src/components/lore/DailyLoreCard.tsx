'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyLoreCardProps {
  title: string;
  itemName: string;
  itemSymbol?: string;
  loreShort: string;
  onViewFull?: () => void;
  className?: string;
}

export function DailyLoreCard({ 
  title, 
  itemName, 
  itemSymbol, 
  loreShort, 
  onViewFull,
  className 
}: DailyLoreCardProps) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {itemSymbol && (
            <div 
              className="text-2xl font-cinzel text-yellow-400"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              {itemSymbol}
            </div>
          )}
          <div>
            <div className="font-semibold text-foreground">{itemName}</div>
            <div className="text-sm text-muted-foreground">Today's Focus</div>
          </div>
        </div>
        
        <p className="text-foreground text-sm leading-relaxed">
          {loreShort}
        </p>
        
        <div className="text-xs text-muted-foreground">
          Educational copy is placeholder; real content coming soon.
        </div>
        
        {onViewFull && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewFull}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View in Mystic Book
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
