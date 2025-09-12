'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface PillData {
  title: string;
  current: number;
  total: number;
  icon?: string;
  href?: string;
  badge?: string;
}

interface PillRowProps {
  pills: PillData[];
  className?: string;
}

export function PillRow({ pills, className }: PillRowProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">Progress</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pills.map((pill, index) => (
          <Card 
            key={index}
            className="border-border bg-card hover:bg-card/80 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {pill.icon && <span className="text-lg">{pill.icon}</span>}
                  <span className="text-sm font-medium text-foreground">
                    {pill.title}
                  </span>
                  {pill.badge && (
                    <Badge variant="outline" className="text-xs">
                      {pill.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {pill.current}/{pill.total}
                </span>
              </div>
              
              <ProgressBar 
                value={pill.current} 
                max={pill.total} 
                showLabel={false}
                className="mb-2"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round((pill.current / pill.total) * 100)}%</span>
                {pill.href && (
                  <a 
                    href={pill.href}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    View →
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
