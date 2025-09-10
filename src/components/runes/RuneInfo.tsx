'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RuneContent } from '@/types/mystic';
import { getRune } from '@/lib/content/runes';
import { RuneId } from '@/content/runes-ids';

interface RuneInfoButtonProps {
  runeId: RuneId;
  size?: 'sm' | 'md';
  variant?: 'icon' | 'text';
  className?: string;
  onClick?: () => void;
}

interface RuneInfoDialogProps {
  runeId: RuneId;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function RuneInfoButton({ 
  runeId, 
  size = 'sm', 
  variant = 'icon',
  className,
  onClick
}: RuneInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const rune = getRune(runeId);

  if (!rune) {
    console.warn(`Rune not found: ${runeId}`);
    return null;
  }

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setOpen(true);
    }
  };

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 p-1 h-auto',
          textSizeClasses[size],
          className
        )}
        aria-label={`Open info about ${rune.name}`}
      >
        <Info className="h-3 w-3 mr-1" />
        About
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10',
        sizeClasses[size],
        className
      )}
      aria-label={`Open info about ${rune.name}`}
    >
      <Info className="h-3 w-3" />
    </Button>
  );
}

export function RuneInfoDialog({ 
  runeId, 
  open, 
  onOpenChange, 
  children 
}: RuneInfoDialogProps) {
  const rune = getRune(runeId);

  if (!rune) {
    console.warn(`Rune not found: ${runeId}`);
    return null;
  }

  const hasReversed = rune.reversed && rune.reversed.trim() !== '';
  const hasInfo = rune.info && rune.info.trim() !== '';
  const hasKeywords = rune.keywords && rune.keywords.length > 0;
  const hasMetadata = rune.element || rune.phoneme || (rune.altNames && rune.altNames.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <span 
              className="text-3xl font-cinzel"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              {rune.symbol}
            </span>
            <div>
              <div className="text-xl font-bold">{rune.name}</div>
              {rune.phoneme && (
                <div className="text-sm text-muted-foreground">
                  Phoneme: <span className="text-yellow-400">{rune.phoneme}</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upright Meaning */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Upright</h4>
            <p className="text-sm text-muted-foreground">{rune.upright}</p>
          </div>

          {/* Reversed Meaning */}
          {hasReversed && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">Reversed</h4>
              <p className="text-sm text-yellow-400/80 italic">{rune.reversed}</p>
            </div>
          )}

          {/* Keywords */}
          {hasKeywords && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {rune.keywords!.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {hasInfo ? (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Details</h4>
              <p className="text-sm text-muted-foreground">{rune.info}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground italic">
                Details coming soon
              </p>
            </div>
          )}

          {/* Metadata */}
          {hasMetadata && (
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-1 gap-2 text-xs">
                {rune.element && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Element:</span>
                    <span className="text-yellow-400 capitalize">{rune.element}</span>
                  </div>
                )}
                {rune.altNames && rune.altNames.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alt. Names:</span>
                    <span className="text-yellow-400">{rune.altNames.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
