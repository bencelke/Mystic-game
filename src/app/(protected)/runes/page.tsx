'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dailyRuneAction } from './actions';
import Link from 'next/link';

interface RuneData {
  id: string;
  symbol: string;
  name: string;
  upright: string;
  reversed: string;
}

interface DailyRuneResult {
  rune: RuneData;
  reversed: boolean;
  xpAwarded: number;
  alreadyClaimed: boolean;
}

export default function RunesPage() {
  const [result, setResult] = useState<DailyRuneResult | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get today's rune on mount
    dailyRuneAction().then((response) => {
      if (response.success) {
        setResult(response);
        // If already claimed, show the rune immediately
        if (response.alreadyClaimed) {
          setIsFlipped(true);
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

  const handleCardClick = () => {
    if (!isFlipped && result && !result.alreadyClaimed) {
      setIsFlipped(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-4">Daily Rune</div>
            <div className="text-muted-foreground">Loading your mystical guidance...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-4">Daily Rune</div>
            <div className="text-red-400 mb-4">Error: {error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-4">Daily Rune</div>
            <div className="text-muted-foreground">No rune available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            Daily <span className="text-primary">Rune</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Seek wisdom from the ancient Elder Futhark. One free rune per day.
          </p>
        </div>

        {/* Rune Card */}
        <div className="flex justify-center">
          <motion.div
            className="perspective-1000"
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
                    className="w-80 h-96"
                  >
                    <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="text-6xl mb-4 text-yellow-300">🔮</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Mystic Rune
                        </h3>
                        <p className="text-muted-foreground">
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
                    className="w-80 h-96 absolute inset-0"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Card className="w-full h-full mystic-card border-2 border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-glow">
                      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                        {/* Rune Symbol */}
                        <div 
                          className="text-8xl mb-4 font-cinzel"
                          style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          {result.rune.symbol}
                        </div>
                        
                        {/* Rune Name */}
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          {result.rune.name}
                        </h3>
                        
                        {/* Meaning */}
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-200 font-medium">Upright:</span>
                            <p className="text-gray-300 mt-1">{result.rune.upright}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-amber-400 font-medium italic">Reversed:</span>
                            <p className="text-amber-300 mt-1 italic">{result.rune.reversed}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-6 p-3 rounded-lg bg-card/50 border border-border">
                          {result.alreadyClaimed ? (
                            <p className="text-muted-foreground text-sm">
                              Already claimed today
                            </p>
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
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/codex">
            <Button 
              variant="outline" 
              className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
            >
              Go to Codex
            </Button>
          </Link>
          
          <Link href="/arcade">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Back to Arcade
            </Button>
          </Link>
        </div>

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
      </div>
    </div>
  );
}
