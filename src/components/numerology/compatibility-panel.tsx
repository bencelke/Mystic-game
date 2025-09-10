'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { compatibilityAction, CompatibilityResult, CompatibilityInput } from '@/app/(protected)/numerology/actions';
import { VisionModal } from '@/components/ui/vision-modal';
import { useAuth } from '@/lib/auth/context';
import { useVision } from '@/lib/vision/use-vision';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { WheelInline } from '@/components/wheel/wheel-inline';
import { ShareRow } from '@/components/share/ShareRow';
import Link from 'next/link';

export function CompatibilityPanel() {
  const { user } = useAuth();
  const { 
    isModalOpen, 
    currentPlacement,
    currentReward,
    eligibility, 
    isLoading: visionLoading, 
    openVision, 
    closeVision, 
    handleVisionComplete 
  } = useVision();
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();
  
  const [formData, setFormData] = useState({
    yourName: '',
    yourDob: '',
    partnerName: '',
    partnerDob: ''
  });
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        yourName: user.displayName || '',
        yourDob: user.dob || ''
      }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.yourName.trim()) {
      newErrors.yourName = 'Your name is required';
    }
    
    if (!formData.yourDob) {
      newErrors.yourDob = 'Your birth date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.yourDob)) {
      newErrors.yourDob = 'Please use YYYY-MM-DD format';
    }
    
    if (!formData.partnerName.trim()) {
      newErrors.partnerName = 'Partner name is required';
    }
    
    if (!formData.partnerDob) {
      newErrors.partnerDob = 'Partner birth date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.partnerDob)) {
      newErrors.partnerDob = 'Please use YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await ensureAuthed();

    setLoading(true);
    setResult(null);

    try {
      const input: CompatibilityInput = {
        partnerName: formData.partnerName.trim(),
        partnerDob: formData.partnerDob
      };

      const compatibilityResult = await compatibilityAction(input);
      setResult(compatibilityResult);

      if (!compatibilityResult.success && compatibilityResult.error?.includes('Insufficient orbs')) {
        openVision('numerology_compat', 'PASS');
      }
    } catch (error) {
      console.error('Error performing compatibility ritual:', error);
      setResult({
        success: false,
        error: 'Failed to perform compatibility ritual'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVisionCompleteCallback = async (reward: 'ORB' | 'PASS') => {
    // Re-run the compatibility action after vision
    await handleSubmit();
  };

  const handleReset = () => {
    setFormData({
      yourName: user?.displayName || '',
      yourDob: user?.dob || '',
      partnerName: '',
      partnerDob: ''
    });
    setResult(null);
    setErrors({});
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Compatibility Reading</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter both birth dates to discover your cosmic connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yourName" className="text-foreground">Your Name</Label>
              <Input
                id="yourName"
                value={formData.yourName}
                onChange={(e) => setFormData(prev => ({ ...prev, yourName: e.target.value }))}
                className="bg-background border-border text-foreground min-h-[44px]"
                placeholder="Enter your name"
                autoComplete="name"
              />
              {errors.yourName && <p className="text-destructive text-sm">{errors.yourName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yourDob" className="text-foreground">Your Birth Date</Label>
              <Input
                id="yourDob"
                type="date"
                value={formData.yourDob}
                onChange={(e) => setFormData(prev => ({ ...prev, yourDob: e.target.value }))}
                className="bg-background border-border text-foreground min-h-[44px]"
                inputMode="numeric"
              />
              {errors.yourDob && <p className="text-destructive text-sm">{errors.yourDob}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerName" className="text-foreground">Partner's Name</Label>
              <Input
                id="partnerName"
                value={formData.partnerName}
                onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                className="bg-background border-border text-foreground min-h-[44px]"
                placeholder="Enter partner's name"
                autoComplete="name"
              />
              {errors.partnerName && <p className="text-destructive text-sm">{errors.partnerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerDob" className="text-foreground">Partner's Birth Date</Label>
              <Input
                id="partnerDob"
                type="date"
                value={formData.partnerDob}
                onChange={(e) => setFormData(prev => ({ ...prev, partnerDob: e.target.value }))}
                className="bg-background border-border text-foreground min-h-[44px]"
                inputMode="numeric"
              />
              {errors.partnerDob && <p className="text-destructive text-sm">{errors.partnerDob}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 min-h-[44px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? 'Calculating...' : 'Read Compatibility'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="min-h-[44px] border-border text-foreground"
              >
                Reset
              </Button>
            </div>

            <div className="text-center pt-2">
              <Badge variant="secondary" className="text-muted-foreground">
                {user?.proEntitlement ? 'Free for Pro users' : 'Cost: 1 Orb'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Compatibility Result</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your cosmic connection revealed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              result.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(result.score || 0)}`}>
                      {result.score}%
                    </div>
                    <Badge variant={getScoreBadgeVariant(result.score || 0)} className="mt-2">
                      {result.score && result.score >= 85 ? 'Excellent' : 
                       result.score && result.score >= 70 ? 'Good' : 
                       result.score && result.score >= 50 ? 'Fair' : 'Poor'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Your Numbers</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Life Path:</span>
                        <span className="text-foreground">{result.you?.lp}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name Number:</span>
                        <span className="text-foreground">{result.you?.nn}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Partner's Numbers</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Life Path:</span>
                        <span className="text-foreground">{result.partner?.lp}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name Number:</span>
                        <span className="text-foreground">{result.partner?.nn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-card/50 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Interpretation</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {result.blurb}
                    </p>
                  </div>

                  {result.xpAwarded && (
                    <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                      <p className="text-emerald-300 text-sm text-center">
                        ✨ +{result.xpAwarded} XP earned!
                      </p>
                    </div>
                  )}

                  {/* Share Row */}
                  <div className="mt-6">
                    <ShareRow
                      kind="compat"
                      params={{
                        score: result.score || 0,
                        dateUTC: new Date(),
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-destructive">{result.error}</p>
                  {result.error?.includes('Insufficient orbs') && (
                    <Button
                      onClick={() => openVision('numerology_compat', 'PASS')}
                      variant="secondary"
                      className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                    >
                      🔮 Watch a Vision to perform ritual
                    </Button>
                  )}
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-4">💕</div>
                <p>Enter birth dates to discover your cosmic connection</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wheel Inline */}
      <WheelInline className="mt-6" />

      {/* Vision Modal */}
      <VisionModal
        isOpen={isModalOpen}
        onClose={closeVision}
        onComplete={handleVisionCompleteCallback}
        placement={currentPlacement || 'numerology_compat'}
        eligibility={eligibility || { enabled: false, reason: 'not-auth' }}
        reward={currentReward}
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
