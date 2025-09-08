'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deepNumerologyAction, DeepNumerologyResult } from '@/app/(protected)/numerology/actions';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { useAuth } from '@/lib/auth/context';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { WheelInline } from '@/components/wheel/wheel-inline';

export function DeepReadingPanel() {
  const { user } = useAuth();
  const [deepResult, setDeepResult] = useState<DeepNumerologyResult | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeepContent, setShowDeepContent] = useState(false);
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();

  const performDeepReading = async () => {
    // Check if user is Pro
    if (!user?.proEntitlement) {
      setShowUpgradeModal(true);
      return;
    }

    await ensureAuthed();

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

  return (
    <div className="space-y-8">
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

      {/* Wheel Inline */}
      <WheelInline className="mt-6" />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Deep Numerology Reading"
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
