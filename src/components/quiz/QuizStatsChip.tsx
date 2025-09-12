'use client';

import { Badge } from '@/components/ui/badge';
import { getQuizStats } from '@/lib/progress/local';
import { t, getCurrentLocale } from '@/lib/i18n/quiz';
import { cn } from '@/lib/utils';

interface QuizStatsChipProps {
  kind: 'rune' | 'number';
  id: string | number;
  className?: string;
}

export function QuizStatsChip({ kind, id, className }: QuizStatsChipProps) {
  const stats = getQuizStats(kind, id);
  const locale = getCurrentLocale();

  if (!stats || stats.attempts === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge variant="secondary" className="text-xs">
        {t('bestScore', { percent: stats.best }, locale)}
      </Badge>
      <Badge variant="outline" className="text-xs text-muted-foreground">
        {t('attempts', { count: stats.attempts }, locale)}
      </Badge>
      {stats.attempts > 1 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {t('lastScore', { percent: stats.last }, locale)}
        </Badge>
      )}
    </div>
  );
}
