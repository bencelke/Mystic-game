'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdModal } from '@/components/ui/ad-modal';
import { dailyRuneAction, adRuneAction } from '@/app/(protected)/runes/actions';
import { getTodayRuneCountAction } from '@/app/(protected)/stats/actions';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { WheelInline } from '@/components/wheel/wheel-inline';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { RuneInfoButton } from './RuneInfo';
import { RuneDetailDrawer } from './RuneDetailDrawer';
import { RuneId } from '@/content/runes-ids';
import Link from 'next/link';

interface RuneData {
  id: string;
  symbol: string;
  name: string;
  upright: string;
  reversed: string;
}

interface DailyRuneResult {
  success: boolean;
  rune?: RuneData;
  reversed?: boolean;
  xpAwarded?: number;
  alreadyClaimed?: boolean;
  error?: string;
}

export function DailyRunePanel() {
  const [result, setResult] = useState<DailyRuneResult | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [othersCount, setOthersCount] = useState<number | null>(null);
  const [selectedRuneId, setSelectedRuneId] = useState<RuneId | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();
  const prefersReducedMotion = useReducedMotion();

  const fetchOthersCount = async (runeId: string) => {
    try {
      const countResult = await getTodayRuneCountAction(runeId);
      setOthersCount(countResult.count);
    } catch (error) {
      console.error('Error fetching others count:', error);
    }
  };

  useEffect(() => {
    // Get today's rune on mount
    dailyRuneAction().then((response) => {
      setResult(response);
      if (response.success) {
        // If already claimed, show the rune immediately
        if (response.alreadyClaimed) {
          setIsFlipped(true);
        }
        // Fetch others count if we have a rune
        if (response.rune) {
          fetchOthersCount(response.rune.id);
        }
      } else {
        setError(response.error || 'Failed to get daily rune');
      }
      setIsLoading(false);
    }).catch((err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }, []);

  const handleCardClick = async () => {
    if (!isFlipped && result && result.success && !result.alreadyClaimed) {
      await ensureAuthed();
      setIsFlipped(true);
      // Fetch others count when revealing
      if (result.rune) {
        fetchOthersCount(result.rune.id);
      }
    }
  };

  const handleAdComplete = async () => {
    await ensureAuthed();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adRuneAction('daily');
      setResult(response);
      
      if (!response.success) {
        setError(response.error || 'Failed to complete ad ritual');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-foreground mb-4">Daily Rune</div>
        <div className="text-muted-foreground">Loading your mystical guidance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-foreground mb-4">Daily Rune</div>
        <div className="text-red-400 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!result || !result.success || !result.rune) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-foreground mb-4">Daily Rune</div>
        <div className="text-muted-foreground">No rune available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rune Card */}
      <div className="flex justify-center px-4">
        {prefersReducedMotion ? (
          /* Simple fade transition for reduced motion */
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="cursor-pointer"
                  onClick={handleCardClick}
                >
                  <Card className="w-full aspect-[4/5] mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                    <CardContent className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
                      <div className="text-4xl sm:text-6xl mb-4 text-yellow-300">🔮</div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                        Mystic Rune
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {result.alreadyClaimed 
                          ? "Click to reveal today's rune" 
                          : "Click to reveal your daily guidance"
                        }
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="front"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="cursor-pointer"
                  onClick={handleCardClick}
                >
                  <Card className="w-full aspect-[4/5] mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                    <CardContent className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
                      {/* Rune Symbol */}
                      <div 
                        className="text-6xl sm:text-8xl mb-4 font-cinzel"
                        style={{ fontFamily: 'var(--font-cinzel)' }}
                      >
                        {result.rune.symbol}
                      </div>
                      
                      {/* Rune Name */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                          {result.rune.name}
                        </h3>
                        <RuneInfoButton 
                          runeId={result.rune.id as any} 
                          size="sm"
                          onClick={() => {
                            setSelectedRuneId(result.rune.id as RuneId);
                            setIsDrawerOpen(true);
                          }}
                        />
                      </div>
                      
                      {/* Meaning */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-foreground font-medium">Upright:</span>
                          <p className="text-muted-foreground mt-1">{result.rune.upright}</p>
                        </div>
                        <div>
                          <span className="text-yellow-400 font-medium italic">Reversed:</span>
                          <p className="text-yellow-400/80 mt-1 italic">{result.rune.reversed}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* 3D flip animation for normal motion */
          <motion.div
            className="perspective-1000 w-full max-w-sm"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              onClick={handleCardClick}
            >
              {/* Card Back (Mystic Theme) */}
              <AnimatePresence>
                {!isFlipped && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full aspect-[4/5]"
                  >
                    <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                      <CardContent className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
                        <div className="text-4xl sm:text-6xl mb-4 text-yellow-300">🔮</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                          Mystic Rune
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {result.alreadyClaimed 
                            ? "Click to reveal today's rune" 
                            : "Click to reveal your daily guidance"
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Front (Rune Revealed) */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: -180 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    className="w-full aspect-[4/5] absolute inset-0"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                      <CardContent className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
                        {/* Rune Symbol */}
                        <div 
                          className="text-6xl sm:text-8xl mb-4 font-cinzel"
                          style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          {result.rune.symbol}
                        </div>
                        
                        {/* Rune Name */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                            {result.rune.name}
                          </h3>
                          <RuneInfoButton runeId={result.rune.id as any} size="sm" />
                        </div>
                        
                        {/* Meaning */}
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div>
                            <span className="text-foreground font-medium">Upright:</span>
                            <p className="text-muted-foreground mt-1">{result.rune.upright}</p>
                          </div>
                          <div>
                            <span className="text-yellow-400 font-medium italic">Reversed:</span>
                            <p className="text-yellow-400/80 mt-1 italic">{result.rune.reversed}</p>
                          </div>
                        </div>

                      {/* Others drew this */}
                      {othersCount !== null && (
                        <div className="mt-4 text-center">
                          <p className="text-muted-foreground text-sm">
                            Others drew this rune today: <span className="text-yellow-400 font-semibold">{othersCount}</span>
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-6 p-3 rounded-lg bg-card/50 border border-border">
                        {result.alreadyClaimed ? (
                          <div className="text-center space-y-3">
                            <p className="text-muted-foreground text-sm">
                              Already claimed today
                            </p>
                            <Button
                              onClick={() => setShowAdModal(true)}
                              variant="secondary"
                              className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                            >
                              🔮 Watch a Vision to draw again
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-green-400 text-sm font-medium">
                              +{result.xpAwarded} XP earned!
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                              Rune unlocked in your codex
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
        <Link href="/codex" className="w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full min-h-[44px] border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
          >
            View Codex
          </Button>
        </Link>
        
        <Link href="/arcade" className="w-full sm:w-auto">
          <Button 
            className="w-full min-h-[44px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Back to Explore
          </Button>
        </Link>
      </div>

      {/* Wheel Inline */}
      <WheelInline className="mt-6" />

      {/* Info */}
      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="text-center py-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            About Daily Runes
          </h3>
          <p className="text-muted-foreground text-sm">
            Each day, you receive one free rune from the Elder Futhark. 
            The same rune appears for you all day, and each rune unlocks in your codex collection.
          </p>
        </CardContent>
      </Card>

      {/* Ad Modal */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={handleAdComplete}
        ritualType="daily"
      />

      {/* Auth Gate Dialog */}
      <AuthGateDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAuthenticated={onAuthenticated}
      />

      {/* Rune Detail Drawer */}
      <RuneDetailDrawer
        runeId={selectedRuneId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedRuneId(null);
        }}
      />
    </div>
  );
}
