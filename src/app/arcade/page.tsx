'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DevOrbControls } from '@/components/orbs/dev-orb-controls';
import { VisionModal } from '@/components/ui/vision-modal';
import { OnlineChip } from '@/components/presence/OnlineChip';
import { dailyCheckInAction } from '@/app/(protected)/progression/actions';
import { useVision } from '@/lib/vision/use-vision';
import { useAuth } from '@/lib/auth/context';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';

export default function ArcadePage() {
  const hasCheckedIn = useRef(false);
  const { user } = useAuth();
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();
  const { 
    isModalOpen, 
    currentPlacement,
    currentReward,
    eligibility, 
    isLoading, 
    openVision, 
    closeVision, 
    handleVisionComplete 
  } = useVision();

  // Mock user data - in production, this would come from auth context
  const mockUser = {
    proEntitlement: false, // Set to true to test Pro user behavior
    orbCount: 0, // Set to 0 to test ad flow, or higher to test normal flow
  };

  useEffect(() => {
    // Daily check-in on first visit
    if (!hasCheckedIn.current) {
      hasCheckedIn.current = true;
      
      dailyCheckInAction().then((result) => {
        if (result.success && result.awardedXP && result.awardedXP > 0) {
          // TODO: Add toast notification when toast system is available
          console.log(`Daily check-in: +${result.awardedXP} XP`);
          
          if (result.newAchievement) {
            console.log(`New achievement: ${result.newAchievement}`);
          }
        }
      }).catch((error) => {
        console.error('Daily check-in failed:', error);
      });
    }
  }, []);

  const handleVisionClick = (placement: 'rune_daily' | 'rune_spread2' | 'rune_spread3' | 'numerology_compat') => {
    openVision(placement, 'PASS');
  };

  const handleRitualClick = async (path: string) => {
    await ensureAuthed();
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            Welcome to{' '}
            <span className="text-yellow-400">Mystic</span>
          </h1>
          <p className="mt-2 sm:mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Discover your mystical journey through ancient wisdom and cosmic guidance.
          </p>
        </div>

        {/* Dev Controls (Development Only) */}
        {process.env.NODE_ENV !== 'production' && (
          <DevOrbControls />
        )}

        {/* Ritual Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Runes Card */}
          <Card className="hover:shadow-lg transition-shadow border-border bg-card">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                <span className="text-3xl">🔮</span>
              </div>
              <CardTitle className="text-2xl text-foreground">Ancient Runes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Seek wisdom from the Elder Futhark
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => handleRitualClick('/runes?tab=daily')}
                  variant="outline" 
                  className="w-full min-h-[44px] justify-start border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <span className="mr-2">🔮</span>
                  Daily Rune (Free)
                </Button>
                <Button 
                  onClick={() => handleRitualClick('/runes?tab=spread2')}
                  variant="outline" 
                  className="w-full min-h-[44px] justify-start border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <span className="mr-2">🔮🔮</span>
                  Two-Rune Spread (1 Orb)
                </Button>
                <Button 
                  onClick={() => handleRitualClick('/runes?tab=spread3')}
                  variant="outline" 
                  className="w-full min-h-[44px] justify-start border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <span className="mr-2">🔮🔮🔮</span>
                  Three-Rune Spread (2 Orbs)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Numerology Card */}
          <Card className="hover:shadow-lg transition-shadow border-border bg-card">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                <span className="text-3xl">🔢</span>
              </div>
              <CardTitle className="text-2xl text-foreground">Cosmic Numerology</CardTitle>
              <CardDescription className="text-muted-foreground">
                Discover your cosmic numbers and divine guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => handleRitualClick('/numerology?tab=daily')}
                  variant="outline" 
                  className="w-full min-h-[44px] justify-start border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <span className="mr-2">🔢</span>
                  Daily Number (Free)
                </Button>
                <Button 
                  onClick={() => handleRitualClick('/numerology?tab=deep')}
                  variant="outline" 
                  className="w-full min-h-[44px] justify-start border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <span className="mr-2">✨</span>
                  Deep Reading (Pro)
                </Button>
                <Button 
                  onClick={() => handleRitualClick('/numerology?tab=compat')}
                  variant="outline" 
                  className="w-full min-h-[44px] justify-start border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <span className="mr-2">💕</span>
                  Compatibility (1 Orb)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card className="border-dashed border-border">
          <CardContent className="text-center py-8 md:py-12">
            <h3 className="text-lg md:text-xl font-semibold text-muted-foreground mb-2">
              More Rituals Coming Soon
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Crystal healing, astrological charts, and more mystical experiences
            </p>
          </CardContent>
        </Card>

      {/* Vision Modal */}
      <VisionModal
        isOpen={isModalOpen}
        onClose={closeVision}
        onComplete={handleVisionComplete}
        placement={currentPlacement || 'rune_daily'}
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
