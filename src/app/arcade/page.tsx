'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DevOrbControls } from '@/components/orbs/dev-orb-controls';
import { dailyCheckInAction } from '@/app/(protected)/progression/actions';

export default function ArcadePage() {
  const hasCheckedIn = useRef(false);

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
          {/* Runes */}
          <Link href="/runes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">🔮</span>
                </div>
                <CardTitle className="text-primary">Runes</CardTitle>
                <CardDescription>Ancient symbols of power</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="secondary" className="mb-2">Daily: Free</Badge>
                <p className="text-sm text-muted-foreground">
                  Daily rune for guidance and wisdom
                </p>
              </CardContent>
            </Card>
          </Link>

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
    </div>
  );
}
