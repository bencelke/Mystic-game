import { stripe } from '@/lib/stripe/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import { stripeEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Read raw body
    const body = await request.text();
    
    // Get signature from headers
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');
    
    if (!sig) {
      console.error('Missing stripe-signature header');
      return new Response('Missing stripe-signature header', { status: 400 });
    }
    
    if (!stripeEnv?.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        stripeEnv.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }
    
    console.log('Received webhook event:', event.type);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const uid = session.metadata?.uid;
        const plan = session.metadata?.plan;
        
        if (!uid || !subscriptionId || !customerId) {
          console.error('Missing required data in checkout.session.completed');
          break;
        }
        
        // Fetch subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        
        // Determine plan from price ID
        let derivedPlan: 'monthly' | 'yearly';
        if (priceId === stripeEnv.STRIPE_PRICE_PRO_MONTHLY) {
          derivedPlan = 'monthly';
        } else if (priceId === stripeEnv.STRIPE_PRICE_PRO_YEARLY) {
          derivedPlan = 'yearly';
        } else {
          console.error('Unknown price ID:', priceId);
          break;
        }
        
        // Update user document
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.update({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          proEntitlement: true,
          proSince: FieldValue.serverTimestamp(),
          proPlan: derivedPlan,
          proCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
        });
        
        console.log(`Updated user ${uid} with Pro subscription (${derivedPlan})`);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        
        // Find user by customer ID
        const usersQuery = await adminDb
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();
        
        if (usersQuery.empty) {
          console.error('No user found for customer:', customerId);
          break;
        }
        
        const userDoc = usersQuery.docs[0];
        const userRef = userDoc.ref;
        
        // Determine if subscription is active
        const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status);
        
        // Get price ID to determine plan
        const priceId = subscription.items.data[0]?.price.id;
        let derivedPlan: 'monthly' | 'yearly' | undefined;
        if (priceId === stripeEnv.STRIPE_PRICE_PRO_MONTHLY) {
          derivedPlan = 'monthly';
        } else if (priceId === stripeEnv.STRIPE_PRICE_PRO_YEARLY) {
          derivedPlan = 'yearly';
        }
        
        // Update user document
        const updateData: any = {
          proEntitlement: isActive,
          proCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
        };
        
        if (derivedPlan) {
          updateData.proPlan = derivedPlan;
        }
        
        await userRef.update(updateData);
        
        console.log(`Updated subscription for user ${userDoc.id}: active=${isActive}, plan=${derivedPlan}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        
        // Find user by customer ID
        const usersQuery = await adminDb
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();
        
        if (usersQuery.empty) {
          console.error('No user found for customer:', customerId);
          break;
        }
        
        const userDoc = usersQuery.docs[0];
        const userRef = userDoc.ref;
        
        // Update user document - remove subscription but keep customer ID
        await userRef.update({
          proEntitlement: false,
          stripeSubscriptionId: FieldValue.delete(),
          proCurrentPeriodEnd: FieldValue.delete()
        });
        
        console.log(`Cancelled subscription for user ${userDoc.id}`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
}
