'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequireAuth } from '@/components/auth';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { createCheckoutSessionAction, createPortalSessionAction, getBillingStatusAction } from '../billing/actions';
import { isStripeConfigured } from '@/lib/stripe/client';

export default function AccountPage() {
  const { user } = useAuth();
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [billingStatus, setBillingStatus] = useState<{
    isPro: boolean;
    plan?: 'monthly' | 'yearly';
    currentPeriodEnd?: string;
    stripeConfigured: boolean;
  } | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadBillingStatus();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.dob) {
          setDob(userData.dob);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const loadBillingStatus = async () => {
    try {
      setBillingLoading(true);
      const result = await getBillingStatusAction();
      if ('error' in result) {
        console.error('Error loading billing status:', result.error);
        toast.error('Failed to load billing status');
      } else {
        setBillingStatus(result);
      }
    } catch (error) {
      console.error('Error loading billing status:', error);
      toast.error('Failed to load billing status');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSaveDob = async () => {
    if (!user) return;
    
    // Validate DOB format
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) {
      toast.error('Please enter date in YYYY-MM-DD format');
      return;
    }

    // Validate date is valid
    const date = new Date(dob);
    if (isNaN(date.getTime())) {
      toast.error('Please enter a valid date');
      return;
    }

    // Validate date is not in the future
    if (date > new Date()) {
      toast.error('Date of birth cannot be in the future');
      return;
    }

    // Validate reasonable age (not too old)
    const age = new Date().getFullYear() - date.getFullYear();
    if (age > 150) {
      toast.error('Please enter a valid date of birth');
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        dob: dob
      });
      toast.success('Date of birth saved successfully!');
    } catch (error) {
      console.error('Error saving DOB:', error);
      toast.error('Failed to save date of birth');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    try {
      setBillingLoading(true);
      const result = await createCheckoutSessionAction({ plan });
      if ('error' in result) {
        toast.error(result.error);
      } else {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setBillingLoading(true);
      const result = await createPortalSessionAction();
      if ('error' in result) {
        toast.error(result.error);
      } else {
        window.location.href = result.portalUrl;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setBillingLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your Mystic Arcade profile</p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Set your date of birth to unlock Numerology rituals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-foreground">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-background border-border text-foreground"
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-sm text-muted-foreground">
                  Required for Numerology Daily Number ritual
                </p>
              </div>

              <Button
                onClick={handleSaveDob}
                disabled={saving || !dob}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
              >
                {saving ? 'Saving...' : 'Save Date of Birth'}
              </Button>

              {dob && (
                <div className="mt-6 p-4 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                  <p className="text-emerald-300 text-sm">
                    ✓ Date of birth set! You can now access Numerology rituals.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mystic Pro Billing Card */}
          <Card className="border-border bg-card mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                Mystic Pro
                {billingStatus?.isPro && (
                  <span className="px-2 py-1 text-xs font-bold bg-yellow-400 text-black rounded-full">
                    PRO
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {billingStatus?.isPro 
                  ? 'Unlock unlimited access to all Mystic features'
                  : 'Upgrade to unlock unlimited access to all Mystic features'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {billingLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                  <p className="text-muted-foreground text-sm">Loading billing status...</p>
                </div>
              ) : !billingStatus?.stripeConfigured ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm mb-4">
                    Billing is not configured. Please contact support.
                  </p>
                </div>
              ) : billingStatus.isPro ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-300 font-semibold">
                        {billingStatus.plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan
                      </span>
                      <span className="text-emerald-300 text-sm">
                        Active
                      </span>
                    </div>
                    {billingStatus.currentPeriodEnd && (
                      <p className="text-emerald-300/80 text-sm">
                        Renews on {formatDate(billingStatus.currentPeriodEnd)}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Pro Benefits:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        No ads - Skip all Vision prompts
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        Unlimited orbs - Never run out of energy
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        2× XP multiplier - Level up faster
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        Deep Numerology readings
                      </li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={handleManageBilling}
                    disabled={billingLoading}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
                  >
                    {billingLoading ? 'Loading...' : 'Manage Billing'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Pro Benefits:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        No ads - Skip all Vision prompts
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        Unlimited orbs - Never run out of energy
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        2× XP multiplier - Level up faster
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span>
                        Deep Numerology readings
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleCheckout('monthly')}
                      disabled={billingLoading}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
                    >
                      {billingLoading ? 'Loading...' : 'Go Pro — Monthly'}
                    </Button>
                    <Button
                      onClick={() => handleCheckout('yearly')}
                      disabled={billingLoading}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
                    >
                      {billingLoading ? 'Loading...' : 'Go Pro — Yearly (Save)'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Your date of birth is used to calculate your personal numerology numbers.
              <br />
              This data is stored securely and only used for ritual calculations.
            </p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
