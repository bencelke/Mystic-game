'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  current: number;
  total: number;
  icon?: string;
  href?: string;
  className?: string;
  showProgress?: boolean;
  badge?: string;
}

export function MetricCard({ 
  title, 
  current, 
  total, 
  icon, 
  href,
  className,
  showProgress = true,
  badge
}: MetricCardProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const content = (
    <Card className={cn("border-border bg-card hover:bg-card/80 transition-colors", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-foreground flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {title}
          {badge && (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-yellow-400">
            {current}
          </span>
          <span className="text-sm text-muted-foreground">
            / {total}
          </span>
        </div>
        {showProgress && (
          <ProgressBar 
            value={current} 
            max={total} 
            showLabel={false}
          />
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}
