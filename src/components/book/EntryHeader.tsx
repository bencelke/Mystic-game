'use client';

import { Badge } from '@/components/ui/badge';
import { getLoreRead, getNotesCount, getQuizStats } from '@/lib/progress/local';
import { cn } from '@/lib/utils';

interface EntryHeaderProps {
  kind: 'rune' | 'number';
  id: string | number;
  name: string;
  isUnlocked: boolean;
  className?: string;
}

export function EntryHeader({ 
  kind, 
  id, 
  name, 
  isUnlocked,
  className 
}: EntryHeaderProps) {
  const loreRead = getLoreRead(kind, id);
  const notesCount = getNotesCount(kind, id);
  const quizStats = getQuizStats(kind, id);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{name}</h2>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isUnlocked ? "default" : "secondary"}
            className={isUnlocked ? "bg-yellow-400 text-black" : ""}
          >
            {isUnlocked ? "Unlocked" : "Locked"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {loreRead && (
          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
            Lore Read
          </Badge>
        )}
        
        {quizStats && quizStats.attempts > 0 && (
          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
            Quiz Best: {quizStats.best}%
          </Badge>
        )}
        
        {notesCount > 0 && (
          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
            Notes: {notesCount}
          </Badge>
        )}
        
        {quizStats && quizStats.best === 100 && (
          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
            Perfect Quiz
          </Badge>
        )}
      </div>
    </div>
  );
}
