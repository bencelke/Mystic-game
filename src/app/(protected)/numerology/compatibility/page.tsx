'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { compatibilityAction, CompatibilityResult, CompatibilityInput } from '../actions';
import { VisionModal } from '@/components/ui/vision-modal';
import { useAuth } from '@/lib/auth/context';
import { useVision } from '@/lib/vision/use-vision';
import Link from 'next/link';

export default function CompatibilityPage() {
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
    <RequireAuth>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Numerology Compatibility</h1>
            <p className="text-muted-foreground">Discover the cosmic connection between two souls</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Input Details</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your information and your partner's details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Your Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">You</h3>
                  <div className="space-y-2">
                    <Label htmlFor="yourName" className="text-foreground">
                      Your Name
                    </Label>
                    <Input
                      id="yourName"
                      value={formData.yourName}
                      onChange={(e) => setFormData(prev => ({ ...prev, yourName: e.target.value }))}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter your name"
                    />
                    {errors.yourName && (
                      <p className="text-sm text-destructive">{errors.yourName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yourDob" className="text-foreground">
                      Your Birth Date
                    </Label>
                    <Input
                      id="yourDob"
                      type="date"
                      value={formData.yourDob}
                      onChange={(e) => setFormData(prev => ({ ...prev, yourDob: e.target.value }))}
                      className="bg-background border-border text-foreground"
                    />
                    {errors.yourDob && (
                      <p className="text-sm text-destructive">{errors.yourDob}</p>
                    )}
                  </div>
                </div>

                {/* Partner Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Partner</h3>
                  <div className="space-y-2">
                    <Label htmlFor="partnerName" className="text-foreground">
                      Partner's Name
                    </Label>
                    <Input
                      id="partnerName"
                      value={formData.partnerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter partner's name"
                    />
                    {errors.partnerName && (
                      <p className="text-sm text-destructive">{errors.partnerName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerDob" className="text-foreground">
                      Partner's Birth Date
                    </Label>
                    <Input
                      id="partnerDob"
                      type="date"
                      value={formData.partnerDob}
                      onChange={(e) => setFormData(prev => ({ ...prev, partnerDob: e.target.value }))}
                      className="bg-background border-border text-foreground"
                    />
                    {errors.partnerDob && (
                      <p className="text-sm text-destructive">{errors.partnerDob}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  {user?.proEntitlement ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? 'Calculating Compatibility...' : 'Read Compatibility'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? 'Calculating Compatibility...' : 'Read Compatibility (1 Orb)'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Result Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Compatibility Result</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your cosmic connection revealed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {result.success ? (
                      <>
                        {/* Score Display */}
                        <div className="text-center">
                          <div className={`text-6xl font-bold ${getScoreColor(result.score!)} mb-2`}>
                            {result.score}
                          </div>
                          <Badge variant={getScoreBadgeVariant(result.score!)} className="text-lg px-4 py-2">
                            Compatibility Score
                          </Badge>
                        </div>

                        {/* Numbers Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 rounded-lg bg-card border border-border">
                            <h4 className="font-semibold text-foreground mb-2">You</h4>
                            <div className="space-y-2">
                              <div>
                                <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                                  Life Path: {result.you?.lp}
                                </Badge>
                              </div>
                              <div>
                                <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                                  Name: {result.you?.nn}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-card border border-border">
                            <h4 className="font-semibold text-foreground mb-2">Partner</h4>
                            <div className="space-y-2">
                              <div>
                                <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                                  Life Path: {result.partner?.lp}
                                </Badge>
                              </div>
                              <div>
                                <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                                  Name: {result.partner?.nn}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interpretation */}
                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-black/20 border border-yellow-500/30">
                          <h4 className="font-semibold text-yellow-400 mb-2">Cosmic Interpretation</h4>
                          <p className="text-foreground leading-relaxed">
                            {result.blurb}
                          </p>
                        </div>

                        {/* XP Notification */}
                        {result.xpAwarded && (
                          <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                            <p className="text-emerald-300 text-sm text-center">
                              ✨ +{result.xpAwarded} XP earned!
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button onClick={handleReset} variant="outline" className="flex-1">
                            Run Again
                          </Button>
                          <Link href="/codex" className="flex-1">
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
                          {result.error || 'Failed to calculate compatibility'}
                        </p>
                        {result.error?.includes('Insufficient orbs') && (
                          <Button
                            onClick={() => openVision('numerology_compat', 'PASS')}
                            variant="secondary"
                            className="text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50"
                          >
                            🔮 Watch a Vision to proceed
                          </Button>
                        )}
                        <Button onClick={handleReset} variant="outline">
                          Try Again
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔮</div>
                    <p className="text-muted-foreground">
                      Enter your details and your partner's information to discover your cosmic compatibility.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Compatibility is calculated using Life Path and Name Numbers from both birth dates and names.
              <br />
              Each number carries unique cosmic energy that influences relationships.
            </p>
          </div>
        </div>

        {/* Vision Modal */}
        <VisionModal
          isOpen={isModalOpen}
          onClose={closeVision}
          onComplete={handleVisionCompleteCallback}
          placement={currentPlacement || 'numerology_compat'}
          eligibility={eligibility || { enabled: false, reason: 'not-auth' }}
          reward={currentReward}
        />
      </div>
    </RequireAuth>
  );
}
