# Finternet Payment Integration

Complete payment gateway integration using the Finternet Payment API (FMM Finternet Lab).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup](#setup)
- [API Reference](#api-reference)
- [Frontend Components](#frontend-components)
- [Security](#security)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Overview

This integration enables secure payments through the Finternet Payment API, supporting:

- ✅ Payment intent creation
- ✅ Payment status tracking
- ✅ Payment cancellation
- ✅ Multiple currencies (USDC, USDT, ETH, BTC)
- ✅ Multiple payment types (CONDITIONAL, IMMEDIATE, ESCROW)
- ✅ Test and production environments
- ✅ Retry logic with exponential backoff
- ✅ Idempotency support

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND                                   │
├─────────────────────────────────────────────────────────────────┤
│  PaymentForm          PaymentStatus         usePayments Hook    │
│  (payment-form.tsx)   (payment-status.tsx)  (use-payments.ts)   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API ROUTES                                 │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/payments/create-intent                                │
│  GET  /api/payments/status/:id                                   │
│  DELETE /api/payments/status/:id                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT SERVICE                               │
├─────────────────────────────────────────────────────────────────┤
│  lib/services/payments.ts                                        │
│  - API authentication                                            │
│  - Request validation                                            │
│  - Retry logic                                                   │
│  - Error handling                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINTERNET API                                 │
│           https://api.fmm.finternetlab.io/v1                    │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
lib/
├── services/
│   └── payments.ts          # Payment service module
├── types/
│   └── payments.ts          # TypeScript types
└── env.ts                   # Environment configuration

app/
└── api/
    └── payments/
        ├── create-intent/
        │   └── route.ts     # POST endpoint
        └── status/
            └── [id]/
                └── route.ts # GET/DELETE endpoints

components/
└── habitat/
    ├── payment-form.tsx     # Payment form component
    └── payment-status.tsx   # Payment status display

hooks/
└── use-payments.ts          # Payment hook
```

---

## Setup

### 1. Environment Variables

Add to your `.env.local` file:

```bash
# Required for payments
FINTERNET_API_KEY=sk_test_your_api_key_here

# Optional: Override default API URL
# FINTERNET_API_URL=https://api.fmm.finternetlab.io/v1
```

### 2. API Keys

| Environment | Key Prefix | Usage |
|------------|------------|-------|
| Development | `sk_test_*` | Test payments, no real transactions |
| Production | `sk_live_*` | Real payments |

Get your API key from [https://finternetlab.io](https://finternetlab.io)

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start Development Server

```bash
pnpm dev
```

---

## API Reference

### POST /api/payments/create-intent

Creates a new payment intent.

**Request:**

```json
{
  "amount": "10.00",
  "currency": "USDC",
  "type": "CONDITIONAL",
  "settlementMethod": "OFF_RAMP_MOCK",
  "settlementDestination": "account_123",
  "description": "Payment for services",
  "metadata": {
    "orderId": "order_123"
  }
}
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Idempotency-Key` | No | Unique key to prevent duplicates |

**Response (201 Created):**

```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx123",
    "amount": "10.00",
    "currency": "USDC",
    "type": "CONDITIONAL",
    "status": "PENDING",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "account_123",
    "createdAt": "2026-02-05T10:00:00Z",
    "updatedAt": "2026-02-05T10:00:00Z",
    "expiresAt": "2026-02-05T11:00:00Z"
  },
  "timestamp": "2026-02-05T10:00:00Z"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string | Yes | Payment amount (e.g., "10.00") |
| `currency` | string | Yes | USDC, USDT, ETH, BTC |
| `type` | string | Yes | CONDITIONAL, IMMEDIATE, ESCROW |
| `settlementMethod` | string | Yes | OFF_RAMP_MOCK, OFF_RAMP_LIVE, WALLET_TRANSFER, BANK_TRANSFER |
| `settlementDestination` | string | Yes | Account ID or wallet address |
| `description` | string | No | Payment description |
| `metadata` | object | No | Additional key-value pairs |

---

### GET /api/payments/status/:id

Retrieves the status of a payment intent.

**Response:**

```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx123",
    "status": "COMPLETED",
    "transactionHash": "0x..."
  },
  "timestamp": "2026-02-05T10:05:00Z"
}
```

**Payment Statuses:**

| Status | Description |
|--------|-------------|
| `PENDING` | Payment created, awaiting processing |
| `PROCESSING` | Payment is being processed |
| `COMPLETED` | Payment successful |
| `FAILED` | Payment failed |
| `CANCELLED` | Payment was cancelled |
| `EXPIRED` | Payment expired |

---

### DELETE /api/payments/status/:id

Cancels a payment intent.

**Response:**

```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx123",
    "status": "CANCELLED"
  },
  "message": "Payment intent cancelled successfully",
  "timestamp": "2026-02-05T10:10:00Z"
}
```

---

## Frontend Components

### PaymentForm

Complete payment form with validation and error handling.

```tsx
import { PaymentForm } from '@/components/habitat/payment-form';

function MyPaymentPage() {
  return (
    <PaymentForm
      defaultAmount="10.00"
      defaultCurrency="USDC"
      onSuccess={(paymentIntent) => {
        console.log('Payment created:', paymentIntent.id);
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultAmount` | string | "" | Pre-filled amount |
| `defaultCurrency` | PaymentCurrency | "USDC" | Default currency |
| `defaultSettlementDestination` | string | "" | Default destination |
| `description` | string | "" | Payment description |
| `metadata` | object | undefined | Additional metadata |
| `onSuccess` | function | - | Called on success |
| `onError` | function | - | Called on error |

---

### PaymentStatus

Displays payment status with optional polling.

```tsx
import { PaymentStatus } from '@/components/habitat/payment-status';

function MyStatusPage() {
  return (
    <PaymentStatus
      paymentIntentId="pi_xxx123"
      enablePolling={true}
      pollingInterval={5000}
      onComplete={(paymentIntent) => {
        console.log('Payment completed!');
      }}
    />
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `paymentIntentId` | string | required | Payment intent ID |
| `enablePolling` | boolean | true | Auto-refresh status |
| `pollingInterval` | number | 5000 | Refresh interval (ms) |
| `onStatusChange` | function | - | Called on status change |
| `onComplete` | function | - | Called when completed |
| `onError` | function | - | Called on error |

---

### usePayments Hook

React hook for programmatic payment control.

```tsx
import { usePayments } from '@/hooks/use-payments';

function MyComponent() {
  const {
    isLoading,
    error,
    paymentIntent,
    createPayment,
    getPaymentStatus,
    cancelPayment,
    reset,
  } = usePayments();

  const handlePayment = async () => {
    const result = await createPayment({
      amount: '25.00',
      currency: 'USDC',
      settlementDestination: 'my_account',
    });
    
    if (result) {
      console.log('Created:', result.id);
    }
  };

  return (
    <button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

---

## Security

### Best Practices Implemented

1. **Environment Variables Only**
   - API keys stored in environment variables
   - Never exposed to client-side code

2. **Server-Side Only**
   - All API calls made from backend
   - Frontend never calls Finternet directly

3. **Input Validation**
   - Amount, currency, type validation
   - Settlement destination required

4. **Secure Headers**
   - X-API-Key authentication
   - Idempotency keys supported

5. **Error Handling**
   - Secure error responses
   - No sensitive data in errors

6. **API Key Rotation Ready**
   - Single point of configuration
   - Easy to rotate keys

### What NOT to Do

```typescript
// ❌ NEVER do this - exposes API key to client
const response = await fetch('https://api.fmm.finternetlab.io/v1/payment-intents', {
  headers: {
    'X-API-Key': 'sk_test_xxx' // NEVER!
  }
});

// ✅ DO this - call your backend API
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  body: JSON.stringify({ amount: '10.00', ... })
});
```

---

## Testing

### Run Test Suite

```bash
# Show help
node test-payments.js --help

# Create a test payment
node test-payments.js --create

# Check payment status
node test-payments.js --status pi_xxx123

# Cancel a payment
node test-payments.js --cancel pi_xxx123

# Use mock responses (no real API calls)
node test-payments.js --mock --create
```

### Example cURL Commands

```bash
# Create payment intent
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test_$(date +%s)" \
  -d '{
    "amount": "10.00",
    "currency": "USDC",
    "type": "CONDITIONAL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "test_account"
  }'

# Get payment status
curl http://localhost:3000/api/payments/status/pi_xxx123

# Cancel payment
curl -X DELETE http://localhost:3000/api/payments/status/pi_xxx123
```

### Postman Collection

Import the `FinternetHackathonPG.postman_collection.json` file into Postman for pre-configured requests.

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_API_KEY` | 401 | API key not configured |
| `INVALID_API_KEY` | 401 | Invalid or expired API key |
| `INVALID_AMOUNT` | 400 | Invalid amount format |
| `INVALID_CURRENCY` | 400 | Unsupported currency |
| `INVALID_PAYMENT_TYPE` | 400 | Invalid payment type |
| `PAYMENT_NOT_FOUND` | 404 | Payment intent not found |
| `PAYMENT_EXPIRED` | 400 | Payment has expired |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `NETWORK_ERROR` | 500 | Network connectivity issue |

### Retry Logic

The service includes automatic retry with exponential backoff:

- **Max Retries:** 3
- **Initial Delay:** 1 second
- **Backoff:** 1s → 2s → 4s

Non-retryable errors (validation, auth) are not retried.

---

## Deployment

### Production Checklist

- [ ] Set `FINTERNET_API_KEY` with production key (`sk_live_*`)
- [ ] Verify environment variables are not exposed
- [ ] Test payment flow in production
- [ ] Monitor API rate limits
- [ ] Set up error alerting
- [ ] Configure idempotency key storage (optional)

### Environment Variables

```bash
# Production
NODE_ENV=production
FINTERNET_API_KEY=sk_live_your_production_key
```

### Vercel Deployment

Add environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add `FINTERNET_API_KEY` with your production key
3. Set scope to "Production" only

---

## Support

- Finternet API Documentation: [https://docs.finternetlab.io](https://docs.finternetlab.io)
- API Status: [https://status.finternetlab.io](https://status.finternetlab.io)
- Support Email: support@finternetlab.io
