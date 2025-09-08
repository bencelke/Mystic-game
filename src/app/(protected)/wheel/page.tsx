'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RequireAuth } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisionModal } from '@/components/ui/vision-modal';
import { getWheelStatusAction, spinDailyWheelAction, spinVisionWheelAction } from './actions';
import { useVision } from '@/lib/vision/use-vision';
import { WHEEL_SEGMENTS, getSegmentCenterAngle } from '@/lib/wheel/rewards';
import Link from 'next/link';

interface WheelStatus {
  remaining: number;
  used: number;
  freeLimit: number;
  max: number;
  pro: boolean;
}

interface SpinResult {
  segment: any;
  summary: any;
  remaining: number;
}

function WheelPageContent() {
  const [status, setStatus] = useState<WheelStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null);
  
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

  useEffect(() => {
    loadWheelStatus();
  }, []);

  const loadWheelStatus = async () => {
    try {
      setLoading(true);
      const response = await getWheelStatusAction();
      if (response.success) {
        setStatus({
          remaining: response.remaining!,
          used: response.used!,
          freeLimit: response.freeLimit!,
          max: response.max!,
          pro: response.pro!
        });
      }
    } catch (error) {
      console.error('Error loading wheel status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailySpin = async () => {
    if (spinning || !status || status.remaining === 0) return;
    
    try {
      setSpinning(true);
      setResult(null);
      
      const response = await spinDailyWheelAction();
      if (response.success && response.segment) {
        // Calculate rotation for the selected segment
        const targetAngle = getSegmentCenterAngle(response.segment.index, WHEEL_SEGMENTS.length);
        const spins = 5 + Math.random() * 3; // 5-8 full rotations
        const finalRotation = wheelRotation + (spins * 360) + (360 - targetAngle);
        
        setWheelRotation(finalRotation);
        setResult({
          segment: response.segment,
          summary: response.summary,
          remaining: response.remaining || 0
        });
        setLastSpinResult({
          segment: response.segment,
          summary: response.summary,
          remaining: response.remaining || 0
        });
        
        // Update status
        await loadWheelStatus();
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
    } finally {
      setSpinning(false);
    }
  };

  const handleVisionSpin = () => {
    if (!status || status.remaining === 0) return;
    openVision('wheel', 'PASS');
  };

  const handleVisionCompleteCallback = async (visionResult: any) => {
    if (visionResult.pass) {
      try {
        setSpinning(true);
        setResult(null);
        
        const response = await spinVisionWheelAction();
        if (response.success && response.segment) {
          // Calculate rotation for the selected segment
          const targetAngle = getSegmentCenterAngle(response.segment.index, WHEEL_SEGMENTS.length);
          const spins = 5 + Math.random() * 3; // 5-8 full rotations
          const finalRotation = wheelRotation + (spins * 360) + (360 - targetAngle);
          
          setWheelRotation(finalRotation);
          setResult({
            segment: response.segment,
            summary: response.summary,
            remaining: response.remaining || 0
          });
          setLastSpinResult({
            segment: response.segment,
            summary: response.summary,
            remaining: response.remaining || 0
          });
          
          // Update status
          await loadWheelStatus();
        }
      } catch (error) {
        console.error('Error spinning vision wheel:', error);
      } finally {
        setSpinning(false);
      }
    }
    closeVision();
  };

  const getSegmentColor = (index: number) => {
    const colors = [
      'bg-purple-600',
      'bg-blue-600', 
      'bg-indigo-600',
      'bg-violet-600',
      'bg-purple-700',
      'bg-blue-700',
      'bg-indigo-700',
      'bg-violet-700'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wheel...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load wheel status</p>
          <Button onClick={loadWheelStatus} className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground mb-4">
            <span className="text-yellow-400">Mystic Wheel</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Spin the wheel daily for orbs, XP, and special items. Free spins reset every day!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Wheel */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Pointer */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
              </div>
              
              {/* Wheel Container */}
              <motion.div
                className="w-80 h-80 rounded-full border-4 border-yellow-400 relative overflow-hidden"
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 2.5, ease: "easeOut" }}
              >
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const angle = (360 / WHEEL_SEGMENTS.length) * index;
                  const centerAngle = getSegmentCenterAngle(index, WHEEL_SEGMENTS.length);
                  
                  return (
                    <div
                      key={segment.id}
                      className={`absolute w-full h-full ${getSegmentColor(index)}`}
                      style={{
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 360/WHEEL_SEGMENTS.length - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 360/WHEEL_SEGMENTS.length - 90) * Math.PI / 180)}%)`,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '50% 50%'
                      }}
                    >
                      <div 
                        className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm"
                        style={{
                          transform: `rotate(${-angle}deg)`,
                          transformOrigin: '50% 50%'
                        }}
                      >
                        {segment.label}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Wheel Status</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your daily spin allowance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Spins remaining today:</span>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    {status.remaining} / {status.max}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Free spins used:</span>
                  <span className="text-foreground">{status.used} / {status.freeLimit}</span>
                </div>

                {status.pro && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pro benefits:</span>
                    <Badge className="bg-yellow-400 text-black">2x Free Spins</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spin Controls */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Spin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status.remaining > 0 ? (
                  <>
                    <Button
                      onClick={handleDailySpin}
                      disabled={spinning || status.used >= status.freeLimit}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {spinning ? 'Spinning...' : 
                       status.used < status.freeLimit ? 'Spin (Free)' : 'No Free Spins Left'}
                    </Button>

                    {status.used >= status.freeLimit && status.remaining > 0 && (
                      <Button
                        onClick={handleVisionSpin}
                        disabled={spinning || visionLoading}
                        variant="secondary"
                        className="w-full text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                      >
                        🔮 Watch a Vision for extra spin
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No spins remaining today</p>
                    <p className="text-sm text-muted-foreground">
                      Come back tomorrow for more spins!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Result Display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-yellow-400/50 bg-yellow-400/5">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 text-center">🎉 Reward Earned!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                      <div className="text-2xl font-bold text-foreground">
                        {result.segment.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.summary.orbsGranted && `+${result.summary.orbsGranted} Orbs granted`}
                        {result.summary.xpGranted && `+${result.summary.xpGranted} XP granted`}
                        {result.summary.streakFreezeGranted && `+${result.summary.streakFreezeGranted} Streak Freeze granted`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.remaining} spins remaining today
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4">
              <Link href="/arcade" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Arcade
                </Button>
              </Link>
              <Link href="/codex" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Codex
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-dashed border-border bg-card/50">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              About the Mystic Wheel
            </h3>
            <p className="text-muted-foreground text-sm">
              Spin the wheel daily for rewards! Free users get 1 free spin per day, 
              Pro users get 2. Watch Visions for extra spins up to the daily maximum. 
              Rewards include orbs, XP, and special Streak Freeze items.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vision Modal */}
      <VisionModal
        isOpen={isModalOpen}
        onClose={closeVision}
        onComplete={handleVisionCompleteCallback}
        placement={currentPlacement || 'rune_daily'}
        eligibility={eligibility || { enabled: false, reason: 'not-auth' }}
        reward={currentReward}
      />
    </div>
  );
}

export default function WheelPage() {
  return (
    <RequireAuth>
      <WheelPageContent />
    </RequireAuth>
  );
}
