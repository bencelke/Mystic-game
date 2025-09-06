# Stripe Setup for Mystic Pro

This guide explains how to set up Stripe for the Mystic Pro billing system.

## 1. Environment Variables

Create a `.env.local` file with the following Stripe variables:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
APP_BASE_URL=http://localhost:3000
```

## 2. Stripe Dashboard Setup

### Create Products and Prices

1. Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
2. Create two products:
   - **Mystic Pro Monthly** - $9.99/month
   - **Mystic Pro Yearly** - $99.99/year (save 17%)
3. Copy the Price IDs and add them to your `.env.local`

### Set up Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## 3. Local Development

### Using Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret from the CLI output

### Testing

1. Use Stripe test cards: https://stripe.com/docs/testing
2. Test successful payment: `4242 4242 4242 4242`
3. Test failed payment: `4000 0000 0000 0002`

## 4. Production Deployment

1. Update `APP_BASE_URL` to your production domain
2. Use live Stripe keys (not test keys)
3. Update webhook endpoint URL in Stripe Dashboard
4. Test with real payment methods

## 5. Features

### Pro Benefits
- **No Ads**: Skip all Vision prompts
- **Unlimited Orbs**: Never run out of energy
- **2× XP Multiplier**: Level up faster
- **Deep Numerology**: Access to detailed readings

### Billing Management
- Users can manage subscriptions via Stripe Customer Portal
- Automatic webhook handling for subscription changes
- Graceful fallback when Stripe is not configured

## 6. Troubleshooting

### Common Issues

1. **"Billing not configured"**: Check environment variables
2. **Webhook signature verification failed**: Verify `STRIPE_WEBHOOK_SECRET`
3. **Price ID not found**: Check `STRIPE_PRICE_PRO_*` variables

### Debug Mode

Set `NODE_ENV=development` to see detailed error logs.

## 7. Security Notes

- Never commit `.env.local` to version control
- Use test keys for development
- Rotate webhook secrets regularly
- Monitor webhook delivery in Stripe Dashboard
