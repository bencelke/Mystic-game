'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dailyNumerologyAction, DailyNumerologyResult, deepNumerologyAction, DeepNumerologyResult } from './actions';
import { getTodayNumCountAction } from '../stats/actions';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';

export default function NumerologyPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<DailyNumerologyResult | null>(null);
  const [deepResult, setDeepResult] = useState<DeepNumerologyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [deepLoading, setDeepLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeepContent, setShowDeepContent] = useState(false);
  const [othersCount, setOthersCount] = useState<number | null>(null);

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

  const performDeepReading = async () => {
    // Check if user is Pro
    if (!user?.proEntitlement) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setDeepLoading(true);
      const deepResult = await deepNumerologyAction();
      setDeepResult(deepResult);
      
      if (deepResult.success) {
        setShowDeepContent(true);
      }
    } catch (error) {
      console.error('Error performing deep reading:', error);
      setDeepResult({
        success: false,
        error: 'Failed to perform deep reading'
      });
    } finally {
      setDeepLoading(false);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Consulting the cosmic numbers...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (result?.error?.includes('Set your birth date')) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Numerology Daily Number</h1>
              <p className="text-muted-foreground">Discover your cosmic number for today</p>
            </div>

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
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Numerology Daily Number</h1>
            <p className="text-muted-foreground">Discover your cosmic number for today</p>
          </div>

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
                        <div className="w-32 h-32 mx-auto relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-700 rounded-full flex items-center justify-center border-4 border-yellow-400">
                            <span className="text-6xl font-bold text-yellow-400 font-serif">
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

          {/* Deep Reading Section */}
          {result?.success && result.number && (
            <div className="mt-8">
              <Card className="border-border bg-card">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-foreground">Deep Reading</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {user?.proEntitlement 
                      ? 'Unlock deeper insights into your cosmic number' 
                      : 'Pro feature - Upgrade for deeper insights'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {user?.proEntitlement ? (
                    <div className="space-y-4">
                      <Button
                        onClick={performDeepReading}
                        disabled={deepLoading}
                        variant="secondary"
                        className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-500/30 hover:border-yellow-500/50"
                      >
                        {deepLoading ? 'Consulting the cosmos...' : 'Deep Reading'}
                      </Button>

                      {deepResult?.success && showDeepContent && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="mt-6"
                        >
                          <Card className="border-yellow-500/30 bg-gradient-to-br from-purple-900/20 to-black/20">
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                  <span className="text-2xl">✨</span>
                                  <h3 className="text-lg font-semibold text-yellow-400">Deep Cosmic Insight</h3>
                                  <span className="text-2xl">✨</span>
                                </div>
                                
                                <div className="text-left space-y-3">
                                  <p className="text-foreground leading-relaxed">
                                    {deepResult.deepContent}
                                  </p>
                                </div>

                                {deepResult.xpAwarded && (
                                  <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                                    <p className="text-emerald-300 text-sm">
                                      ✨ +{deepResult.xpAwarded} XP earned for deep reading!
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {deepResult?.error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-destructive text-sm">
                            {deepResult.error}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        variant="secondary"
                        className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-500/30 hover:border-yellow-500/50"
                      >
                        Deep Reading (Pro)
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Upgrade to Mystic Pro for detailed cosmic interpretations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Your daily number is calculated from your birth date and today's date.
              <br />
              Each number carries unique cosmic energy and guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Deep Numerology Reading"
      />
    </RequireAuth>
  );
}
