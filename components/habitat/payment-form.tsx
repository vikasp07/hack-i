'use client';

/**
 * Payment Form Component
 * Handles payment intent creation through backend API
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type {
  PaymentCurrency,
  PaymentType,
  SettlementMethod,
  PaymentIntent,
} from '@/lib/types/payments';
import { PAYMENT_CURRENCIES, PAYMENT_TYPES, SETTLEMENT_METHODS } from '@/lib/types/payments';

// ============================================
// TYPES
// ============================================

interface PaymentFormProps {
  /** Callback when payment is successful */
  onSuccess?: (paymentIntent: PaymentIntent) => void;
  /** Callback when payment fails */
  onError?: (error: string) => void;
  /** Default amount */
  defaultAmount?: string;
  /** Default currency */
  defaultCurrency?: PaymentCurrency;
  /** Default settlement destination */
  defaultSettlementDestination?: string;
  /** Optional description for the payment */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
  /** Custom class name */
  className?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================
// COMPONENT
// ============================================

export function PaymentForm({
  onSuccess,
  onError,
  defaultAmount = '',
  defaultCurrency = 'USDC',
  defaultSettlementDestination = '',
  description = '',
  metadata,
  className,
}: PaymentFormProps) {
  // Form state
  const [amount, setAmount] = useState(defaultAmount);
  const [currency, setCurrency] = useState<PaymentCurrency>(defaultCurrency);
  const [paymentType, setPaymentType] = useState<PaymentType>('CONDITIONAL');
  const [settlementMethod, setSettlementMethod] = useState<SettlementMethod>('OFF_RAMP_MOCK');
  const [settlementDestination, setSettlementDestination] = useState(defaultSettlementDestination);
  const [paymentDescription, setPaymentDescription] = useState(description);

  // UI state
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  // Form validation
  const isFormValid = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (!currency) return false;
    if (!paymentType) return false;
    if (!settlementMethod) return false;
    if (!settlementDestination.trim()) return false;
    return true;
  }, [amount, currency, paymentType, settlementMethod, settlementDestination]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      // Generate idempotency key
      const idempotencyKey = `payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          amount,
          currency,
          type: paymentType,
          settlementMethod,
          settlementDestination,
          description: paymentDescription || undefined,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentIntent) {
        setStatus('success');
        setPaymentIntent(data.paymentIntent);
        onSuccess?.(data.paymentIntent);
      } else {
        const errorMessage = data.error || 'Payment creation failed';
        setStatus('error');
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setStatus('error');
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Reset form
  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setPaymentIntent(null);
    setAmount(defaultAmount);
    setCurrency(defaultCurrency);
    setPaymentType('CONDITIONAL');
    setSettlementMethod('OFF_RAMP_MOCK');
    setSettlementDestination(defaultSettlementDestination);
    setPaymentDescription(description);
  };

  // Render success state
  if (status === 'success' && paymentIntent) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle>Payment Created</CardTitle>
          </div>
          <CardDescription>
            Your payment intent has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID:</span>
              <span className="font-mono text-sm">{paymentIntent.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">
                {paymentIntent.amount} {paymentIntent.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{paymentIntent.status.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{paymentIntent.type}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleReset} variant="outline" className="w-full">
            Create Another Payment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <CardTitle>Create Payment</CardTitle>
        </div>
        <CardDescription>
          Make a secure payment using Finternet
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Amount & Currency Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={status === 'loading'}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as PaymentCurrency)}
                disabled={status === 'loading'}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type *</Label>
            <Select
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as PaymentType)}
              disabled={status === 'loading'}
            >
              <SelectTrigger id="paymentType" className="w-full">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Settlement Method */}
          <div className="space-y-2">
            <Label htmlFor="settlementMethod">Settlement Method *</Label>
            <Select
              value={settlementMethod}
              onValueChange={(value) => setSettlementMethod(value as SettlementMethod)}
              disabled={status === 'loading'}
            >
              <SelectTrigger id="settlementMethod" className="w-full">
                <SelectValue placeholder="Select settlement method" />
              </SelectTrigger>
              <SelectContent>
                {SETTLEMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Settlement Destination */}
          <div className="space-y-2">
            <Label htmlFor="settlementDestination">Settlement Destination *</Label>
            <Input
              id="settlementDestination"
              type="text"
              placeholder="Account ID or wallet address"
              value={settlementDestination}
              onChange={(e) => setSettlementDestination(e.target.value)}
              disabled={status === 'loading'}
              aria-required="true"
            />
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Payment for..."
              value={paymentDescription}
              onChange={(e) => setPaymentDescription(e.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          {/* Test Mode Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Test Mode</AlertTitle>
            <AlertDescription>
              This is a test payment. No real funds will be transferred.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={status === 'loading'}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={status === 'loading' || !isFormValid()}
            className="flex-1"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Create Payment
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PaymentForm;
