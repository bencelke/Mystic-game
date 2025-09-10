'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdModal } from '@/components/ui/ad-modal';
import { twoRuneSpreadAction, adRuneAction } from '@/app/(protected)/runes/actions';
import { getTodayRuneCountAction } from '@/app/(protected)/stats/actions';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { WheelInline } from '@/components/wheel/wheel-inline';
import { RuneInfoButton } from './RuneInfo';
import { ShareRow } from '@/components/share/ShareRow';
import Link from 'next/link';

interface SpreadRuneResult {
  id: string;
  symbol: string;
  name: string;
  reversed: boolean;
  upright: string;
  reversedMeaning: string;
}

interface TwoRuneSpreadResult {
  success: boolean;
  runes?: SpreadRuneResult[];
  xpAwarded?: number;
  error?: string;
}

export function Spread2Panel() {
  const [result, setResult] = useState<TwoRuneSpreadResult | null>(null);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [othersCounts, setOthersCounts] = useState<number[]>([]);
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();

  const fetchOthersCounts = async (runes: SpreadRuneResult[]) => {
    try {
      const counts = await Promise.all(
        runes.map(rune => getTodayRuneCountAction(rune.id))
      );
      setOthersCounts(counts.map(c => c.count));
    } catch (error) {
      console.error('Error fetching others counts:', error);
    }
  };

  const handleCastSpread = async () => {
    await ensureAuthed();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await twoRuneSpreadAction();
      setResult(response);
      
      if (response.success && response.runes) {
        // Fetch counts for all runes
        await fetchOthersCounts(response.runes);
      } else {
        setError(response.error || 'Failed to cast spread');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (index: number) => {
    if (result?.success && result.runes) {
      setFlippedCards(prev => {
        const newFlipped = [...prev];
        newFlipped[index] = !newFlipped[index];
        return newFlipped;
      });
    }
  };

  const handleAdComplete = async () => {
    await ensureAuthed();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adRuneAction('spread2');
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide text-foreground">
          Two-Rune <span className="text-yellow-400">Spread</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Cast a powerful two-rune spread to gain deeper insight into your path.
        </p>
        <div className="mt-2 text-yellow-400 font-medium">
          Cost: 1 Orb • Reward: 18 XP
        </div>
      </div>

      {/* Cast Spread Button */}
      {!result?.success && (
        <div className="flex justify-center">
          <Button
            onClick={handleCastSpread}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 text-lg"
          >
            {isLoading ? 'Casting...' : 'Cast Spread'}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center">
          <div className="text-destructive mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            {error}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleCastSpread} variant="outline">
              Try Again
            </Button>
            {error.includes('Not enough energy') && (
              <Button
                onClick={() => setShowAdModal(true)}
                variant="secondary"
                className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
              >
                🔮 Watch a Vision to perform ritual
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Rune Cards */}
      {result?.success && result.runes && (
        <div className="space-y-8">
          {/* XP Award */}
          <div className="text-center">
            <div className="text-yellow-400 text-xl font-bold">
              +{result.xpAwarded} XP earned!
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Runes unlocked in your codex
            </p>
          </div>

          {/* Two Cards Side by Side */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {result.runes.map((rune, index) => (
              <div key={rune.id} className="flex-shrink-0">
                <motion.div
                  className="perspective-1000"
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    className="cursor-pointer"
                    animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onClick={() => handleCardClick(index)}
                  >
                    {/* Card Back */}
                    <AnimatePresence>
                      {!flippedCards[index] && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-80 h-96"
                        >
                          <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow hover:border-yellow-500/50 transition-all duration-300">
                            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                              <div className="text-6xl mb-4 text-yellow-300">🔮</div>
                              <h3 className="text-xl font-semibold text-foreground mb-2">
                                Rune {index + 1}
                              </h3>
                              <p className="text-muted-foreground">
                                Click to reveal
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Card Front */}
                    <AnimatePresence>
                      {flippedCards[index] && (
                        <motion.div
                          initial={{ opacity: 0, rotateY: -180 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          className="w-80 h-96 absolute inset-0"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                              {/* Rune Symbol */}
                              <div 
                                className="text-6xl mb-4 font-cinzel"
                                style={{ fontFamily: 'var(--font-cinzel)' }}
                              >
                                {rune.symbol}
                              </div>
                              
                              {/* Rune Name */}
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <h3 className="text-xl font-bold text-foreground">
                                  {rune.name}
                                </h3>
                                <RuneInfoButton runeId={rune.id as any} size="sm" />
                              </div>
                              
                              {/* Orientation */}
                              <div className="mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  rune.reversed 
                                    ? 'bg-red-900/30 text-red-300 border border-red-500/30' 
                                    : 'bg-green-900/30 text-green-300 border border-green-500/30'
                                }`}>
                                  {rune.reversed ? 'Reversed' : 'Upright'}
                                </span>
                              </div>
                              
                              {/* Meaning */}
                              <div className="text-sm">
                                <p className="text-muted-foreground">
                                  {rune.reversed ? rune.reversedMeaning : rune.upright}
                                </p>
                              </div>

                              {/* Seen today count */}
                              {othersCounts[index] !== undefined && (
                                <div className="mt-3 text-center">
                                  <p className="text-muted-foreground text-xs">
                                    Seen today: <span className="text-yellow-400 font-semibold">{othersCounts[index]}</span>
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Share Row - only show when both cards are revealed */}
          {flippedCards.every(flipped => flipped) && result.runes && result.runes.length > 0 && (
            <div className="mt-8">
              <ShareRow
                kind="rune"
                params={{
                  runeId: result.runes[0].id, // Share the first (primary) rune
                  reversed: result.runes[0].reversed,
                  dateUTC: new Date(),
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link href="/codex">
              <Button 
                variant="outline" 
                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
              >
                View Codex
              </Button>
            </Link>
            
            <Button
              onClick={handleCastSpread}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Cast Another Spread
            </Button>
            
            <Link href="/arcade">
              <Button variant="outline">
                Back to Explore
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Wheel Inline */}
      <WheelInline className="mt-6" />

      {/* Info */}
      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="text-center py-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            About Two-Rune Spreads
          </h3>
          <p className="text-muted-foreground text-sm">
            The two-rune spread reveals the relationship between two aspects of your situation. 
            Each rune may appear upright or reversed, providing deeper insight into your path.
          </p>
        </CardContent>
      </Card>

      {/* Ad Modal */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={handleAdComplete}
        ritualType="spread2"
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
