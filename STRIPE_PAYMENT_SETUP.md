# Stripe Payment Integration with Escrow Setup Guide

This guide will help you set up Stripe payment integration with escrow functionality for your PiqDrop delivery app.

## Overview

The payment system includes:
- **Escrow Payments**: Senders pay upfront, money is held until delivery is completed
- **Automatic Refunds**: If no dropper accepts within 24 hours, automatic refund is processed
- **Secure Payment Processing**: Using Stripe's secure payment infrastructure
- **Payment History**: Track all payments and refunds

## Prerequisites

1. Stripe account (https://stripe.com)
2. Laravel backend with database access
3. React Native apps (PiqDrop and PiqRider)

## Setup Instructions

### 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to https://stripe.com and create an account
   - Complete the verification process
   - Get your API keys from the Dashboard

2. **Get Your API Keys**
   - **Publishable Key**: `pk_test_...` (for frontend)
   - **Secret Key**: `sk_test_...` (for backend)
   - **Webhook Secret**: Create a webhook endpoint for payment events

### 2. Laravel Backend Setup

#### A. Install Stripe PHP SDK
```bash
cd PiqDropAdmin
composer require stripe/stripe-php
```

#### B. Configure Environment Variables
Add these to your `.env` file:
```env
STRIPE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### C. Run Database Migration
```bash
php artisan migrate
```

#### D. Set up Cron Job for Automatic Refunds
Add this to your server's crontab:
```bash
# Run every hour to check for packages that need refunds
0 * * * * cd /path/to/PiqDropAdmin && php artisan escrow:process-refunds
```

### 3. React Native Apps Setup

#### A. Install Stripe React Native SDK
```bash
# For PiqDrop app
cd PiqDrop
npm install @stripe/stripe-react-native

# For PiqRider app  
cd PiqRider
npm install @stripe/stripe-react-native
```

#### B. Update Stripe Publishable Key
In both apps, update the `STRIPE_PUBLISHABLE_KEY` in:
- `PiqDrop/app/payment.tsx`
- `PiqRider/app/payment.tsx` (if you create one)

Replace `'pk_test_your_stripe_publishable_key_here'` with your actual publishable key.

### 4. Payment Flow

#### For Senders (PiqDrop App):
1. User creates a package
2. User clicks "Payment" button on order detail screen
3. Payment screen opens with Stripe card input
4. User enters card details and confirms payment
5. Payment is processed and held in escrow
6. If no dropper accepts within 24 hours, automatic refund is processed

#### For Droppers (PiqRider App):
1. Dropper accepts a package
2. Payment is released from escrow to dropper (future feature)
3. Dropper receives payment after successful delivery

### 5. API Endpoints

The following API endpoints are available:

#### Payment Endpoints:
- `POST /api/payments/create-intent` - Create payment intent for escrow
- `POST /api/payments/confirm` - Confirm payment with payment method
- `GET /api/payments/status/{paymentIntentId}` - Get payment status
- `POST /api/payments/refund` - Request refund for escrow
- `GET /api/payments/history` - Get payment history for user
- `GET /api/payments/package/{packageId}` - Get payment details for package

### 6. Database Schema

#### Payments Table:
```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    package_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_method_id VARCHAR(255) NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status ENUM('pending', 'processing', 'succeeded', 'failed', 'canceled') DEFAULT 'pending',
    payment_type ENUM('escrow', 'release', 'refund') DEFAULT 'escrow',
    refund_reason TEXT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_package_payment_type (package_id, payment_type),
    INDEX idx_user_status (user_id, status),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id)
);
```

### 7. Testing

#### Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

#### Test Scenarios:
1. **Successful Payment**: Use test card `4242 4242 4242 4242`
2. **Failed Payment**: Use test card `4000 0000 0000 0002`
3. **Automatic Refund**: Create a package, don't assign a dropper, wait for refund

### 8. Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always validate payment amounts** on the backend
3. **Use webhooks** for payment status updates
4. **Implement proper error handling** for failed payments
5. **Log all payment activities** for audit purposes

### 9. Production Deployment

#### Before going live:
1. Switch to Stripe live keys
2. Set up webhook endpoints for production
3. Test the complete payment flow
4. Set up monitoring and alerting
5. Configure proper SSL certificates
6. Set up backup and recovery procedures

#### Environment Variables for Production:
```env
STRIPE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### 10. Monitoring and Maintenance

#### Regular Tasks:
1. Monitor payment success/failure rates
2. Check for failed refunds
3. Review payment logs for anomalies
4. Update Stripe SDK versions
5. Monitor webhook delivery status

#### Commands:
```bash
# Process refunds manually
php artisan escrow:process-refunds

# Check payment status
php artisan tinker
>>> App\Models\Payment::where('status', 'failed')->count();
```

## Troubleshooting

### Common Issues:

1. **Payment Intent Creation Fails**
   - Check Stripe secret key configuration
   - Verify package exists and belongs to user
   - Check Stripe account status

2. **Payment Confirmation Fails**
   - Verify client secret is correct
   - Check payment method is valid
   - Ensure payment intent status is correct

3. **Refunds Not Processing**
   - Check cron job is running
   - Verify Stripe account has sufficient funds
   - Check payment intent status

4. **Webhook Issues**
   - Verify webhook endpoint URL
   - Check webhook secret configuration
   - Monitor webhook delivery logs

## Support

For issues related to:
- **Stripe Integration**: Check Stripe documentation and support
- **Laravel Backend**: Check Laravel logs and documentation
- **React Native**: Check React Native and Stripe React Native documentation

## Files Modified/Created

### Laravel Backend:
- `app/Models/Payment.php` - Payment model
- `app/Http/Controllers/Api/PaymentController.php` - Payment API controller
- `database/migrations/2024_01_01_000000_create_payments_table.php` - Database migration
- `app/Console/Commands/ProcessEscrowRefunds.php` - Automatic refund command
- `routes/api.php` - Payment routes added

### React Native Apps:
- `services/payment.service.ts` - Payment service
- `app/payment.tsx` - Payment screen
- `app/(tabs)/orderDetail.tsx` - Updated with payment button
- `i18n/translations/en.ts` - Payment translations

### Configuration:
- `config/services.php` - Stripe configuration (already exists)
- `.env` - Environment variables for Stripe keys 