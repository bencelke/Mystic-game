'use client';

import { usePresence } from '@/lib/presence/usePresence';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function OnlineChip() {
  const { onlineCount, ready } = usePresence();

  if (!ready) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-card text-foreground border-border hover:border-yellow-400 transition-colors duration-200 shadow-glow-sm"
          >
            <span className="text-yellow-400 mr-1">●</span>
            {onlineCount} online
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>People currently exploring Mystic</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
