import Stripe from 'stripe';
import { stripeEnv } from '../env';

// Validate Stripe configuration
if (!stripeEnv?.STRIPE_SECRET_KEY) {
  throw new Error(
    'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.'
  );
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(stripeEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Utility function to create absolute URLs
export function absUrl(path: string): string {
  const base = stripeEnv?.APP_BASE_URL || 'http://localhost:3000';
  return base.replace(/\/$/, '') + path;
}

// Check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  return !!(
    stripeEnv?.STRIPE_SECRET_KEY &&
    stripeEnv?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    stripeEnv?.STRIPE_PRICE_PRO_MONTHLY &&
    stripeEnv?.STRIPE_PRICE_PRO_YEARLY
  );
}

// Get price ID for a plan
export function getPriceId(plan: 'monthly' | 'yearly'): string {
  if (!stripeEnv) {
    throw new Error('Stripe is not configured');
  }
  
  const priceId = plan === 'monthly' 
    ? stripeEnv.STRIPE_PRICE_PRO_MONTHLY 
    : stripeEnv.STRIPE_PRICE_PRO_YEARLY;
    
  if (!priceId) {
    throw new Error(`Price ID for ${plan} plan is not configured`);
  }
  
  return priceId;
}
