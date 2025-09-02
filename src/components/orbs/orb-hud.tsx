'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { getOrbsAction } from '@/app/(protected)/orbs/actions';
import { formatTimeRemaining } from '@/lib/orbs/math';
import { HUD_POLL_INTERVAL_MS, COUNTDOWN_UPDATE_INTERVAL_MS } from '@/lib/orbs/constants';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrbsData {
  current: number;
  max: number;
  nextEtaSec: number;
  granted: number;
}

export const OrbHUD = () => {
  const { user, loading } = useAuth();
  const [orbsData, setOrbsData] = useState<OrbsData | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orbs data
  const fetchOrbs = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getOrbsAction();
      
      if (result.success && result.data) {
        setOrbsData(result.data);
        setCountdown(result.data.nextEtaSec);
      } else {
        setError(result.error || 'Failed to fetch orbs');
      }
    } catch (err) {
      setError('Error fetching orbs');
      console.error('Error fetching orbs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user && !loading) {
      fetchOrbs();
    }
  }, [user, loading, fetchOrbs]);

  // Poll for updates
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchOrbs();
    }, HUD_POLL_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [user, fetchOrbs]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Refetch when countdown hits 0
          fetchOrbs();
          return 0;
        }
        return prev - 1;
      });
    }, COUNTDOWN_UPDATE_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [countdown, fetchOrbs]);

  // Don't render if not authenticated or still loading
  if (loading || !user) return null;

  // Show loading state
  if (isLoading && !orbsData) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Show error state
  if (error && !orbsData) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-destructive/20 border border-destructive/40" />
        <span className="text-sm text-destructive">Error</span>
      </div>
    );
  }

  // Show orbs data
  if (orbsData) {
    const isPro = orbsData.max >= 9999; // Pro users have max >= 9999
    const isFull = orbsData.current >= orbsData.max;
    const isLow = orbsData.current <= 2;
    const isCritical = orbsData.current <= 1;

    // Determine orb color based on status
    let orbColor = 'bg-secondary';
    if (isCritical) orbColor = 'bg-destructive';
    else if (isLow) orbColor = 'bg-warning';
    else if (isFull) orbColor = 'bg-success';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              {/* Orb Icon */}
              <div className="relative">
                <div className={`w-6 h-6 rounded-full ${orbColor} border-2 border-border shadow-lg flex items-center justify-center`}>
                  {isPro ? (
                    <span className="text-xs font-bold text-secondary-foreground">∞</span>
                  ) : (
                    <span className="text-xs font-bold text-secondary-foreground">
                      {orbsData.current}
                    </span>
                  )}
                </div>
                {/* Glow effect */}
                <div className={`absolute inset-0 w-6 h-6 rounded-full ${orbColor} opacity-30 blur-sm animate-pulse`} />
              </div>

              {/* Orb Count (hidden on small screens) */}
              <div className="hidden md:flex items-center gap-1">
                {isPro ? (
                  <span className="text-sm font-medium text-foreground">∞</span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-foreground">
                      {orbsData.current}
                    </span>
                    <span className="text-sm text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground">
                      {orbsData.max}
                    </span>
                  </>
                )}
              </div>

              {/* Countdown (hidden on small screens) */}
              {!isPro && !isFull && countdown > 0 && (
                <div className="hidden lg:block">
                  <span className="text-xs text-muted-foreground">
                    Next in {formatTimeRemaining(countdown)}
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">
                {isPro ? 'Unlimited Orbs' : 'Energy Orbs'}
              </div>
              
              {isPro ? (
                <p className="text-sm text-muted-foreground">
                  Pro members have unlimited orbs for all rituals and activities.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {orbsData.current}/{orbsData.max} orbs available
                  </p>
                  
                  {!isFull && countdown > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Next orb regenerates in {formatTimeRemaining(countdown)}
                    </p>
                  )}
                  
                  {isFull && (
                    <p className="text-sm text-success">Orbs are full!</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    1 orb regenerates every hour. Pro members have unlimited orbs.
                  </p>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
};
