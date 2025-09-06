'use server';

import { stripe, absUrl, getPriceId, isStripeConfigured } from '@/lib/stripe/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { UserDoc } from '@/types/mystic';

// Helper to get current user (mock for now)
async function getCurrentUser(): Promise<{ uid: string; email: string }> {
  // TODO: Replace with actual auth when available
  return {
    uid: 'mock-user-id',
    email: 'user@example.com'
  };
}

// Create Stripe checkout session
export async function createCheckoutSessionAction({ 
  plan 
}: { 
  plan: 'monthly' | 'yearly' 
}): Promise<{ checkoutUrl: string } | { error: string }> {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return { error: 'Billing is not configured. Please contact support.' };
    }

    const { uid, email } = await getCurrentUser();
    
    // Get or create Stripe customer
    let customerId: string;
    
    // Get user document to check for existing customer ID
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() as UserDoc | undefined;
    
    if (userData?.stripeCustomerId) {
      customerId = userData.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { uid }
      });
      customerId = customer.id;
      
      // Save customer ID to user document
      await userRef.set({
        stripeCustomerId: customerId
      }, { merge: true });
    }
    
    // Get price ID for the plan
    const priceId = getPriceId(plan);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: absUrl('/account?success=1'),
      cancel_url: absUrl('/account?canceled=1'),
      allow_promotion_codes: true,
      metadata: {
        uid,
        plan
      },
    });
    
    if (!session.url) {
      return { error: 'Failed to create checkout session' };
    }
    
    return { checkoutUrl: session.url };
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { error: 'Failed to create checkout session. Please try again.' };
  }
}

// Create Stripe billing portal session
export async function createPortalSessionAction(): Promise<{ portalUrl: string } | { error: string }> {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return { error: 'Billing is not configured. Please contact support.' };
    }

    const { uid } = await getCurrentUser();
    
    // Get user document to check for customer ID
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() as UserDoc | undefined;
    
    if (!userData?.stripeCustomerId) {
      return { error: 'No billing account found. Please subscribe first.' };
    }
    
    // Create billing portal session
    const portal = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: absUrl('/account'),
    });
    
    return { portalUrl: portal.url };
    
  } catch (error) {
    console.error('Error creating portal session:', error);
    return { error: 'Failed to create billing portal. Please try again.' };
  }
}

// Get user's billing status
export async function getBillingStatusAction(): Promise<{
  isPro: boolean;
  plan?: 'monthly' | 'yearly';
  currentPeriodEnd?: string;
  stripeConfigured: boolean;
} | { error: string }> {
  try {
    const { uid } = await getCurrentUser();
    
    // Get user document
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() as UserDoc | undefined;
    
    if (!userData) {
      return { error: 'User not found' };
    }
    
    return {
      isPro: userData.proEntitlement || false,
      plan: userData.proPlan,
      currentPeriodEnd: userData.proCurrentPeriodEnd 
        ? new Date(userData.proCurrentPeriodEnd.seconds * 1000).toISOString()
        : undefined,
      stripeConfigured: isStripeConfigured()
    };
    
  } catch (error) {
    console.error('Error getting billing status:', error);
    return { error: 'Failed to get billing status' };
  }
}
