'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisionModal } from '@/components/ui/vision-modal';
import { getWheelStatusAction, spinDailyWheelAction, spinVisionWheelAction } from '@/app/(protected)/wheel/actions';
import { useVision } from '@/lib/vision/use-vision';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { useFeatures } from '@/lib/features/useFeatures';

interface WheelStatus {
  remaining: number;
  used: number;
  freeLimit: number;
  max: number;
  pro: boolean;
}

interface SpinResult {
  success: boolean;
  segment?: any;
  summary?: any;
  remaining?: number;
  error?: string;
}

interface WheelInlineProps {
  className?: string;
}

export function WheelInline({ className }: WheelInlineProps) {
  const [status, setStatus] = useState<WheelStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();
  const { config: featuresConfig, loading: featuresLoading } = useFeatures();
  
  const { 
    isModalOpen, 
    currentPlacement,
    currentReward,
    eligibility, 
    isLoading: visionLoading, 
    openVision, 
    closeVision, 
    handleVisionComplete 
  } = useVision();

  // Don't render if feature is disabled or still loading
  if (featuresLoading || !featuresConfig?.inlineWheelEnabled) {
    return null;
  }

  useEffect(() => {
    loadWheelStatus();
  }, []);

  const loadWheelStatus = async () => {
    try {
      setLoading(true);
      const result = await getWheelStatusAction();
      if (result.success) {
        setStatus({
          remaining: result.remaining || 0,
          used: result.used || 0,
          freeLimit: result.freeLimit || 0,
          max: result.max || 0,
          pro: result.pro || false
        });
      }
    } catch (error) {
      console.error('Error loading wheel status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    await ensureAuthed();
    
    if (!status || status.remaining <= 0) return;

    setSpinning(true);
    try {
      let result;
      if (status.remaining > status.freeLimit) {
        // Use free spin
        result = await spinDailyWheelAction();
      } else {
        // Need vision for extra spin
        openVision('wheel', 'ORB');
        return;
      }

      if (result.success) {
        setLastResult(result);
        // Reload status to update remaining count
        await loadWheelStatus();
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
    } finally {
      setSpinning(false);
    }
  };

  const handleVisionCompleteCallback = async (reward: 'ORB' | 'PASS') => {
    if (reward === 'ORB') {
      // Spin with vision reward
      setSpinning(true);
      try {
        const result = await spinVisionWheelAction();
        if (result.success) {
          setLastResult(result);
          await loadWheelStatus();
        }
      } catch (error) {
        console.error('Error spinning wheel with vision:', error);
      } finally {
        setSpinning(false);
      }
    }
  };

  // Don't show if no spins available and not pro
  if (loading || !status || (status.remaining <= 0 && !status.pro)) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="border-border bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎡</div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Spins remaining: {status.remaining} / {status.max}
                </div>
                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-1"
                  >
                    <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-500/30">
                      {lastResult.summary?.type === 'orb' && `+${lastResult.summary.amount} Orbs`}
                      {lastResult.summary?.type === 'xp' && `+${lastResult.summary.amount} XP`}
                      {lastResult.summary?.type === 'streak_freeze' && `Streak Freeze +${lastResult.summary.amount}`}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {status.remaining > 0 ? (
                <Button
                  onClick={handleSpin}
                  disabled={spinning}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {spinning ? 'Spinning...' : 'Spin'}
                </Button>
              ) : (
                <Button
                  onClick={() => openVision('wheel', 'ORB')}
                  variant="secondary"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                >
                  🔮 Vision for extra spin
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vision Modal */}
      <VisionModal
        isOpen={isModalOpen}
        onClose={closeVision}
        onComplete={handleVisionCompleteCallback}
        placement={currentPlacement || 'wheel'}
        eligibility={eligibility || { enabled: false, reason: 'not-auth' }}
        reward={currentReward}
      />

      {/* Auth Gate Dialog */}
      <AuthGateDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAuthenticated={onAuthenticated}
      />
    </div>
  );
}
