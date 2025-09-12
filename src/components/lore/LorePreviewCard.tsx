'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getRune } from '@/lib/content/runes';
import { getNumber } from '@/lib/content/numbers';
import { cn } from '@/lib/utils';

interface LorePreviewCardProps {
  kind: 'rune' | 'number';
  id: string | number;
  className?: string;
}

export function LorePreviewCard({ kind, id, className }: LorePreviewCardProps) {
  let content: { name: string; loreShort?: string } | null = null;
  let detailUrl = '';

  if (kind === 'rune') {
    content = getRune(id as string);
    detailUrl = `/book?rune=${id}`;
  } else {
    content = getNumber(id as number);
    detailUrl = `/book?num=${id}`;
  }

  if (!content || !content.loreShort) {
    return null;
  }

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Lore of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-cinzel text-yellow-400">
            {kind === 'rune' ? (content as any).symbol : id}
          </div>
          <div>
            <div className="font-semibold text-foreground">{content.name}</div>
            <div className="text-sm text-muted-foreground">
              {kind === 'rune' ? 'Rune' : 'Number'} Wisdom
            </div>
          </div>
        </div>
        
        <p className="text-foreground text-sm leading-relaxed">
          {content.loreShort}
        </p>
        
        <div className="pt-2 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.location.href = detailUrl}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Read full lore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
