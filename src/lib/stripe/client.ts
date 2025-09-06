import { loadStripe } from '@stripe/stripe-js';
import { stripeEnv } from '../env';

// Initialize Stripe on the client side
export const stripePromise = loadStripe(
  stripeEnv?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

// Check if Stripe is properly configured on the client
export function isStripeConfigured(): boolean {
  return !!stripeEnv?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
