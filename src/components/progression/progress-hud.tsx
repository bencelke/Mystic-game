'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getLevelProgress } from '@/lib/progression/math';
import type { UserDoc } from '@/types/mystic';

interface ProgressHUDProps {
  user: UserDoc;
}

export function ProgressHUD({ user }: ProgressHUDProps) {
  const levelProgress = getLevelProgress(user.xp || 0, user.level || 1);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {/* Level Badge */}
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30"
            >
              Lv {user.level || 1}
            </Badge>
            
            {/* Streak Flame */}
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 text-yellow-300 hover:from-yellow-600/30 hover:to-orange-600/30"
            >
              🔥 {user.streak || 0}
            </Badge>
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="bottom" className="max-w-xs">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground">Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Level Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Level {user.level || 1}</span>
                  <span>{user.xp || 0} XP</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${levelProgress * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Daily Check-in Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Daily check-in:</span>
                <span className="text-green-400">+15 XP</span>
              </div>
              
              {/* Achievements */}
              {user.achievements && user.achievements.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Achievements:</div>
                  <div className="flex flex-wrap gap-1">
                    {user.achievements.map((achievement) => (
                      <Badge 
                        key={achievement} 
                        variant="outline" 
                        className="text-xs border-yellow-500/30 text-yellow-300 bg-yellow-500/10"
                      >
                        {achievement === 'first_login' && 'First Login'}
                        {achievement === 'streak_3' && 'Streak 3'}
                        {achievement === 'streak_7' && 'Streak 7'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
