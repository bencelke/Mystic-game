'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, Zap, Star } from 'lucide-react';
import { VisionPlacement, VisionReward, VisionEligibility } from '@/types/vision';
import { formatCooldownTime, getPlacementDisplayName } from '@/lib/vision/eligibility';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reward: VisionReward) => void;
  placement: VisionPlacement;
  eligibility: VisionEligibility;
  reward: VisionReward;
}

export function VisionModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  placement, 
  eligibility, 
  reward 
}: VisionModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setCountdown(0);
    }
  }, [isOpen]);

  // Handle cooldown countdown
  useEffect(() => {
    if (eligibility.reason === 'cooldown' && eligibility.cooldownEtaSec) {
      setCountdown(eligibility.cooldownEtaSec);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [eligibility]);

  const handleStartVision = () => {
    setIsPlaying(true);
    setProgress(0);
    
    // Simulate ad progress
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const increment = 100 / (duration / interval);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          handleVisionComplete();
          return 100;
        }
        return prev + increment;
      });
    }, interval);
  };

  const handleVisionComplete = () => {
    setIsPlaying(false);
    onComplete(reward);
  };

  const getRewardIcon = () => {
    switch (reward) {
      case 'ORB':
        return <Zap className="h-6 w-6 text-yellow-400" />;
      case 'PASS':
        return <Star className="h-6 w-6 text-yellow-400" />;
      default:
        return <Star className="h-6 w-6 text-yellow-400" />;
    }
  };

  const getRewardText = () => {
    switch (reward) {
      case 'ORB':
        return 'Gain 1 Energy Orb';
      case 'PASS':
        return 'Unlock Ritual Access';
      default:
        return 'Ritual Reward';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md mx-4"
        >
          <Card className="border-yellow-500/50 bg-gradient-to-br from-purple-900/90 to-black/90 shadow-2xl shadow-yellow-500/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-4xl sm:text-6xl mb-4">🔮</div>
              <CardTitle className="text-xl sm:text-2xl text-yellow-400 font-cinzel">
                Watch a Vision
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground">
                {getPlacementDisplayName(placement)} - {getRewardText()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Eligibility Status */}
              {!eligibility.enabled ? (
                <div className="text-center space-y-4">
                  {eligibility.reason === 'pro' ? (
                    <>
                      <div className="text-4xl mb-2">✨</div>
                      <p className="text-foreground">
                        You're a Mystic Pro! No vision needed.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pro users have unlimited access to all rituals.
                      </p>
                    </>
                  ) : eligibility.reason === 'cooldown' ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-yellow-400" />
                        <span className="text-foreground">Vision on Cooldown</span>
                      </div>
                      <p className="text-muted-foreground">
                        Please wait {formatCooldownTime(countdown)} before watching another vision.
                      </p>
                    </>
                  ) : eligibility.reason === 'daily-limit' ? (
                    <>
                      <div className="text-4xl mb-2">⏰</div>
                      <p className="text-foreground">
                        Daily vision limit reached
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You've used all your daily visions. Come back tomorrow!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">❌</div>
                      <p className="text-foreground">
                        Vision not available
                      </p>
                    </>
                  )}
                  
                  <Button onClick={onClose} variant="outline" className="w-full min-h-[44px]">
                    Close
                  </Button>
                </div>
              ) : (
                /* Vision Player */
                <div className="space-y-4">
                  {!isPlaying ? (
                    <>
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          {getRewardIcon()}
                          <span className="text-foreground font-semibold">
                            {getRewardText()}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                            {eligibility.remainingToday} visions remaining today
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Watch a mystical vision to unlock this ritual
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleStartVision}
                        className="w-full min-h-[44px] bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-semibold"
                      >
                        🔮 Watch Vision
                      </Button>
                    </>
                  ) : (
                    /* Vision Playing */
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl mb-4 animate-spin">🔮</div>
                        <p className="text-foreground font-semibold mb-2">
                          Vision Playing...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          The cosmic energies are aligning...
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-border rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {Math.round(progress)}% complete
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    disabled={isPlaying}
                  >
                    {isPlaying ? 'Vision in Progress...' : 'Cancel'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
