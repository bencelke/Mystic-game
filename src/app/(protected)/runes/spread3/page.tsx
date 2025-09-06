'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequireAuth } from '@/components/auth';
import { AdModal } from '@/components/ui/ad-modal';
import { threeRuneSpreadAction, adRuneAction } from '../actions';
import { getTodayRuneCountAction } from '../../stats/actions';
import Link from 'next/link';

interface SpreadRuneResult {
  id: string;
  symbol: string;
  name: string;
  reversed: boolean;
  upright: string;
  reversedMeaning: string;
}

interface ThreeRuneSpreadResult {
  success: boolean;
  runes?: SpreadRuneResult[];
  xpAwarded?: number;
  error?: string;
}

function Spread3PageContent() {
  const [result, setResult] = useState<ThreeRuneSpreadResult | null>(null);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [othersCounts, setOthersCounts] = useState<number[]>([]);

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
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await threeRuneSpreadAction();
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
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adRuneAction('spread3');
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
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            Three-Rune <span className="text-primary">Spread</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Cast a powerful three-rune spread to gain comprehensive insight into your path.
          </p>
          <div className="mt-2 text-yellow-400 font-medium">
            Cost: 2 Orbs • Reward: 24 XP
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

            {/* Three Cards - Row on Desktop, Stack on Mobile */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
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
                            className="w-72 h-96"
                          >
                            <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow hover:border-yellow-500/50 transition-all duration-300">
                              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="text-5xl mb-4 text-yellow-300">🔮</div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                  Rune {index + 1}
                                </h3>
                                <p className="text-muted-foreground text-sm">
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
                            className="w-72 h-96 absolute inset-0"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                                {/* Rune Symbol */}
                                <div 
                                  className="text-5xl mb-3 font-cinzel"
                                  style={{ fontFamily: 'var(--font-cinzel)' }}
                                >
                                  {rune.symbol}
                                </div>
                                
                                {/* Rune Name */}
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                  {rune.name}
                                </h3>
                                
                                {/* Orientation */}
                                <div className="mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    rune.reversed 
                                      ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                                      : 'bg-green-900/30 text-green-300 border border-green-500/30'
                                  }`}>
                                    {rune.reversed ? 'Reversed' : 'Upright'}
                                  </span>
                                </div>
                                
                                {/* Meaning */}
                                <div className="text-xs">
                                  <p className="text-muted-foreground">
                                    {rune.reversed ? rune.reversedMeaning : rune.upright}
                                  </p>
                                </div>

                                {/* Seen today count */}
                                {othersCounts[index] !== undefined && (
                                  <div className="mt-2 text-center">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
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
                  Back to Arcade
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Info */}
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              About Three-Rune Spreads
            </h3>
            <p className="text-muted-foreground text-sm">
              The three-rune spread provides comprehensive insight into your situation. 
              Each rune may appear upright or reversed, revealing the past, present, and future aspects of your path.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ad Modal */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={handleAdComplete}
        ritualType="spread3"
      />
    </div>
  );
}

export default function Spread3Page() {
  return (
    <RequireAuth>
      <Spread3PageContent />
    </RequireAuth>
  );
}
