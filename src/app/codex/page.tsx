'use client';

import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ACHIEVEMENT_LABELS } from '@/lib/progression/constants';
import { getLevelProgress } from '@/lib/progression/math';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminDb } from '@/lib/firebase/admin';
import { ELDER_FUTHARK_IDS } from '@/content/runes-ids';
import { getAllRunes } from '@/lib/content/runes';
import { RuneInfoDialog } from '@/components/runes/RuneInfo';
import { RuneDetailDrawer } from '@/components/runes/RuneDetailDrawer';
import { RuneSearchFilters } from '@/components/runes/RuneSearchFilters';
import { useRuneDrawer } from '@/hooks/useRuneDrawer';
import { getFavoriteRunes, toggleRuneFavorite } from '@/lib/runes/favorites';
import { RuneId } from '@/content/runes-ids';

// Get all runes data
const allRunes = getAllRunes();
const runesMap = new Map(allRunes.map(rune => [rune.id, rune]));

// Helper functions for rune data
function getRuneData(runeId: string) {
  return runesMap.get(runeId);
}

export default function CodexPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [collectedRunes, setCollectedRunes] = useState<string[]>([]);
  const [collectedNumbers, setCollectedNumbers] = useState<number[]>([]);
  const [runesLoading, setRunesLoading] = useState(true);
  const [numbersLoading, setNumbersLoading] = useState(true);
  const [filteredRunes, setFilteredRunes] = useState(allRunes);
  const [favorites, setFavorites] = useState<Set<RuneId>>(new Set());
  
  // Rune drawer functionality
  const { isOpen, currentRuneId, openRune, closeRune, changeRune } = useRuneDrawer();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          // Mock some collected runes for demonstration
          const mockCollectedRunes = ['fehu', 'uruz', 'thurisaz'];
          setCollectedRunes(mockCollectedRunes);
          setRunesLoading(false);

          // Mock some collected numerology numbers for demonstration
          const mockCollectedNumbers = [1, 3, 7, 11];
          setCollectedNumbers(mockCollectedNumbers);
          setNumbersLoading(false);

          // Load favorites
          const userFavorites = await getFavoriteRunes(user.uid);
          setFavorites(userFavorites);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setRunesLoading(false);
          setNumbersLoading(false);
        }
      };

      fetchUserData();
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

  // Toggle favorite function
  const handleToggleFavorite = async (runeId: RuneId) => {
    try {
      const newStatus = await toggleRuneFavorite(user.uid, runeId);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newStatus) {
          newFavorites.add(runeId);
        } else {
          newFavorites.delete(runeId);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };


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
            <div className="grid grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <RuneSearchFilters
              runes={allRunes}
              favorites={favorites}
              onFilterChange={setFilteredRunes}
              onRuneClick={openRune}
              onToggleFavorite={handleToggleFavorite}
            />

            {runesLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading rune collection...</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {filteredRunes.map((rune) => {
                  const isCollected = collectedRunes.includes(rune.id);
                  
                  return (
                    <div
                      key={rune.id}
                      className={`aspect-square rounded-lg border-2 transition-all duration-300 relative cursor-pointer ${
                        isCollected
                          ? 'border-yellow-500/50 bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:border-yellow-500/70'
                          : 'border-border/30 bg-card/30 opacity-50'
                      }`}
                      onClick={() => {
                        if (isCollected) {
                          openRune(rune.id as RuneId);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                        {isCollected ? (
                          <>
                            <div 
                              className="text-2xl mb-1 font-cinzel"
                              style={{ fontFamily: 'var(--font-cinzel)' }}
                            >
                              {rune.symbol}
                            </div>
                            <div className="text-xs text-foreground font-medium">
                              {rune.name}
                            </div>
                            {/* Action buttons overlay */}
                            <div className="absolute top-1 right-1 flex gap-1">
                              {/* Favorite button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(rune.id as RuneId);
                                }}
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                  favorites.has(rune.id as RuneId)
                                    ? 'bg-yellow-500/30 text-yellow-400' 
                                    : 'bg-yellow-500/10 text-yellow-400/60 hover:bg-yellow-500/20'
                                }`}
                                aria-label={`${favorites.has(rune.id as RuneId) ? 'Remove from' : 'Add to'} favorites`}
                              >
                                <span className="text-xs">★</span>
                              </button>
                              
                              {/* Info button */}
                              <RuneInfoDialog runeId={rune.id as RuneId}>
                                <button
                                  className="w-4 h-4 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center transition-colors"
                                  aria-label={`Info about ${rune.name}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-yellow-400 text-xs font-bold">i</span>
                                </button>
                              </RuneInfoDialog>
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

        {/* Numerology Numbers Collection */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Numerology Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            {numbersLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading numerology collection...</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22].map((number) => {
                  const isCollected = collectedNumbers.includes(number);
                  const isMasterNumber = number === 11 || number === 22;
                  
                  return (
                    <div
                      key={number}
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
                              className="text-2xl mb-1 font-bold text-yellow-400"
                              style={{ fontFamily: 'var(--font-cinzel)' }}
                            >
                              {number}
                            </div>
                            <div className="text-xs text-foreground font-medium">
                              {isMasterNumber ? 'Master' : 'Number'}
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
                {collectedNumbers.length} of 11 numbers unlocked
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

      {/* Rune Detail Drawer */}
      <RuneDetailDrawer
        runeId={currentRuneId}
        isOpen={isOpen}
        onClose={closeRune}
        onRuneChange={changeRune}
      />
    </div>
  );
}
