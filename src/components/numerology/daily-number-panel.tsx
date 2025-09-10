'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dailyNumerologyAction, DailyNumerologyResult } from '@/app/(protected)/numerology/actions';
import { getTodayNumCountAction } from '@/app/(protected)/stats/actions';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { WheelInline } from '@/components/wheel/wheel-inline';
import { ShareRow } from '@/components/share/ShareRow';
import Link from 'next/link';

export function DailyNumberPanel() {
  const [result, setResult] = useState<DailyNumerologyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [othersCount, setOthersCount] = useState<number | null>(null);
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();

  const fetchOthersCount = async (number: number) => {
    try {
      const countResult = await getTodayNumCountAction(number.toString());
      setOthersCount(countResult.count);
    } catch (error) {
      console.error('Error fetching others count:', error);
    }
  };

  useEffect(() => {
    performDailyNumerology();
  }, []);

  const performDailyNumerology = async () => {
    try {
      setLoading(true);
      const numerologyResult = await dailyNumerologyAction();
      setResult(numerologyResult);
      
      if (numerologyResult.success && numerologyResult.number) {
        // Trigger flip animation after a short delay
        setTimeout(() => setIsFlipped(true), 500);
        // Fetch others count
        await fetchOthersCount(numerologyResult.number);
      }
    } catch (error) {
      console.error('Error performing numerology ritual:', error);
      setResult({
        success: false,
        error: 'Failed to perform numerology ritual'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Consulting the cosmic numbers...</p>
      </div>
    );
  }

  if (result?.error?.includes('Set your birth date')) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Account Required</CardTitle>
            <CardDescription className="text-muted-foreground">
              Set your birth date to unlock Numerology rituals
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-muted-foreground">
              Your date of birth is needed to calculate your personal numerology numbers.
            </p>
            <Link href="/account">
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
                Go to Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border bg-card hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-foreground">Today's Number</CardTitle>
              <CardDescription className="text-muted-foreground">
                {result?.alreadyClaimed ? 'Already claimed today' : 'Your cosmic guidance awaits'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {result?.success && result.number ? (
                <>
                  <motion.div
                    className="relative"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-700 rounded-full flex items-center justify-center border-4 border-yellow-400">
                        <span className="text-4xl sm:text-6xl font-bold text-yellow-400 font-serif">
                          {result.number}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {result.number === 11 || result.number === 22 
                        ? `${result.number} (Master Number)` 
                        : `Number ${result.number}`
                      }
                    </h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {result.meaning}
                    </p>
                  </div>

                  {/* Others got this count */}
                  {othersCount !== null && (
                    <div className="mt-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Others got this number today: <span className="text-yellow-400 font-semibold">{othersCount}</span>
                      </p>
                    </div>
                  )}

                  {result.xpAwarded && !result.alreadyClaimed && (
                    <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                      <p className="text-emerald-300 text-sm">
                        ✨ +{result.xpAwarded} XP earned!
                      </p>
                    </div>
                  )}

                  {result.alreadyClaimed && (
                    <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
                      <p className="text-blue-300 text-sm">
                        Already claimed today
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Link href="/codex">
                      <Button variant="outline" className="w-full">
                        View Codex
                      </Button>
                    </Link>
                  </div>

                  {/* Share Row */}
                  <div className="mt-6">
                    <ShareRow
                      kind="number"
                      params={{
                        numId: result.number,
                        dateUTC: new Date(),
                        mode: 'daily',
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-destructive">
                    {result?.error || 'Failed to perform numerology ritual'}
                  </p>
                  <Button onClick={performDailyNumerology} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Wheel Inline */}
      <WheelInline className="mt-6" />

      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Your daily number is calculated from your birth date and today's date.
          <br />
          Each number carries unique cosmic energy and guidance.
        </p>
      </div>

      {/* Auth Gate Dialog */}
      <AuthGateDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAuthenticated={onAuthenticated}
      />
    </div>
  );
}
