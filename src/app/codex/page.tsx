'use client';

import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ACHIEVEMENT_LABELS } from '@/lib/progression/constants';
import { getLevelProgress } from '@/lib/progression/math';
import { useEffect, useState } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import runesData from '@/content/runes.json';

// Helper functions for rune data
function getRuneSymbol(runeId: string): string {
  const rune = runesData.find((r: any) => r.id === runeId);
  return rune?.symbol || '?';
}

function getRuneName(runeId: string): string {
  const rune = runesData.find((r: any) => r.id === runeId);
  return rune?.name || 'Unknown';
}

export default function CodexPage() {
  const { user, loading } = useAuth();
  const [collectedRunes, setCollectedRunes] = useState<string[]>([]);
  const [runesLoading, setRunesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch user's collected runes from codex
      const fetchCollectedRunes = async () => {
        try {
          const codexDoc = await adminDb.collection('codex').doc(user.uid).get();
          if (codexDoc.exists) {
            const data = codexDoc.data();
            setCollectedRunes(data?.runes || []);
          }
        } catch (error) {
          console.error('Error fetching collected runes:', error);
        } finally {
          setRunesLoading(false);
        }
      };

      fetchCollectedRunes();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Codex</h1>
            <p className="text-muted-foreground">Please sign in to view your progression.</p>
          </div>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(user.xp, user.level);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            <span className="text-primary">Mystic</span> Codex
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Your mystical journey and achievements
          </p>
        </div>

        {/* Progression Overview */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{user.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{user.xp}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">🔥 {user.streak}</div>
                <div className="text-sm text-muted-foreground">Daily Streak</div>
              </div>
            </div>
            
            {/* Level Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Level {user.level} Progress</span>
                <span>{Math.round(levelProgress * 100)}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {user.achievements && user.achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.achievements.map((achievement: string) => (
                  <div key={achievement} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🏆</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {ACHIEVEMENT_LABELS[achievement] || achievement}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Achievement unlocked
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">No achievements yet</div>
                <div className="text-sm text-muted-foreground">
                  Complete daily check-ins and rituals to earn achievements
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rune Collection */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Rune Collection</CardTitle>
          </CardHeader>
          <CardContent>
            {runesLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading rune collection...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 24 }, (_, index) => {
                  const runeId = [
                    'fehu', 'uruz', 'thurisaz', 'ansuz', 'raidho', 'kenaz',
                    'gebo', 'wunjo', 'hagalaz', 'nauthiz', 'isa', 'jera',
                    'eihwaz', 'perthro', 'algiz', 'sowilo', 'tiwaz', 'berkano',
                    'ehwaz', 'mannaz', 'laguz', 'ingwaz', 'dagaz', 'othala'
                  ][index];
                  const isCollected = collectedRunes.includes(runeId);
                  
                  return (
                    <div
                      key={runeId}
                      className={`aspect-square rounded-lg border-2 transition-all duration-300 ${
                        isCollected
                          ? 'border-yellow-500/50 bg-gradient-to-br from-purple-600/20 to-blue-600/20'
                          : 'border-border/30 bg-card/30 opacity-50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                        {isCollected ? (
                          <>
                            <div 
                              className="text-2xl mb-1 font-cinzel"
                              style={{ fontFamily: 'var(--font-cinzel)' }}
                            >
                              {getRuneSymbol(runeId)}
                            </div>
                            <div className="text-xs text-foreground font-medium">
                              {getRuneName(runeId)}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl mb-1 text-muted-foreground">?</div>
                            <div className="text-xs text-muted-foreground">Locked</div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {collectedRunes.length} of 24 runes collected
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="border-dashed border-border">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              More Codex Features Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Tarot spreads and detailed ritual history
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
