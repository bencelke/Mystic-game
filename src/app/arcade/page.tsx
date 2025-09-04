'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DevOrbControls } from '@/components/orbs/dev-orb-controls';
import { AdModal } from '@/components/ui/ad-modal';
import { dailyCheckInAction } from '@/app/(protected)/progression/actions';
import { adRuneAction } from '@/app/(protected)/runes/actions';

export default function ArcadePage() {
  const hasCheckedIn = useRef(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<'daily' | 'spread2' | 'spread3' | null>(null);

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

  const handleAdComplete = async () => {
    if (!selectedRitual) return;
    
    try {
      const response = await adRuneAction(selectedRitual);
      
      if (response.success) {
        // Navigate to the appropriate ritual page
        switch (selectedRitual) {
          case 'daily':
            window.location.href = '/runes';
            break;
          case 'spread2':
            window.location.href = '/runes/spread2';
            break;
          case 'spread3':
            window.location.href = '/runes/spread3';
            break;
        }
      } else {
        console.error('Ad ritual failed:', response.error);
        // Could show error toast here
      }
    } catch (error) {
      console.error('Ad ritual error:', error);
    }
  };

  const handleAdClick = (ritualType: 'daily' | 'spread2' | 'spread3') => {
    setSelectedRitual(ritualType);
    setShowAdModal(true);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            Welcome to the{' '}
            <span className="text-primary">Mystic Arcade</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Choose your ritual: runes, tarot, numerology, or affirmations. 
            Each requires energy orbs to perform.
          </p>
        </div>

        {/* Dev Controls (Development Only) */}
        {process.env.NODE_ENV !== 'production' && (
          <DevOrbControls />
        )}

        {/* Ritual Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Rune */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🔮</span>
              </div>
              <CardTitle className="text-primary">Daily Rune</CardTitle>
              <CardDescription>Ancient symbols of power</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">Daily: Free</Badge>
              <p className="text-sm text-muted-foreground mb-3">
                Daily rune for guidance and wisdom
              </p>
              {!mockUser.proEntitlement && (
                <Button
                  onClick={() => handleAdClick('daily')}
                  variant="secondary"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                >
                  🔮 Watch a Vision
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Two-Rune Spread */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🔮🔮</span>
              </div>
              <CardTitle className="text-primary">Two-Rune Spread</CardTitle>
              <CardDescription>Deeper insight spreads</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">Cost: 1 Orb</Badge>
              <p className="text-sm text-muted-foreground mb-3">
                Cast powerful two-rune spreads
              </p>
              {mockUser.orbCount >= 1 || mockUser.proEntitlement ? (
                <Link href="/runes/spread2">
                  <Button size="sm" className="w-full">
                    Cast Spread
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => handleAdClick('spread2')}
                  variant="secondary"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                >
                  🔮 Watch a Vision
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Three-Rune Spread */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🔮🔮🔮</span>
              </div>
              <CardTitle className="text-primary">Three-Rune Spread</CardTitle>
              <CardDescription>Comprehensive insight spreads</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">Cost: 2 Orbs</Badge>
              <p className="text-sm text-muted-foreground mb-3">
                Cast powerful three-rune spreads
              </p>
              {mockUser.orbCount >= 2 || mockUser.proEntitlement ? (
                <Link href="/runes/spread3">
                  <Button size="sm" className="w-full">
                    Cast Spread
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => handleAdClick('spread3')}
                  variant="secondary"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                >
                  🔮 Watch a Vision
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tarot */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🃏</span>
              </div>
              <CardTitle className="text-primary">Tarot</CardTitle>
              <CardDescription>Divine card readings</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">Cost: 2 Orbs</Badge>
              <p className="text-sm text-muted-foreground">
                Daily draws and full spreads
              </p>
            </CardContent>
          </Card>

          {/* Numerology */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🔢</span>
              </div>
              <CardTitle className="text-primary">Numerology</CardTitle>
              <CardDescription>Sacred number meanings</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">Cost: 1 Orb</Badge>
              <p className="text-sm text-muted-foreground">
                Calculate your life path number
              </p>
            </CardContent>
          </Card>

          {/* Affirmations */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <CardTitle className="text-primary">Affirmations</CardTitle>
              <CardDescription>Positive energy mantras</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-2">Cost: 1 Orb</Badge>
              <p className="text-sm text-muted-foreground">
                Daily affirmations for growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card className="border-dashed border-border">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              More Rituals Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Crystal healing, astrological charts, and more mystical experiences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ad Modal */}
      {selectedRitual && (
        <AdModal
          isOpen={showAdModal}
          onClose={() => {
            setShowAdModal(false);
            setSelectedRitual(null);
          }}
          onAdComplete={handleAdComplete}
          ritualType={selectedRitual}
        />
      )}
    </div>
  );
}
