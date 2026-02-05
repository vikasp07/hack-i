'use client';

/**
 * Payment Hook
 * React hook for managing payment operations
 */

import { useState, useCallback } from 'react';
import type {
  PaymentIntent,
  PaymentCurrency,
  PaymentType,
  SettlementMethod,
  CreatePaymentIntentRequest,
} from '@/lib/types/payments';

// ============================================
// TYPES
// ============================================

export interface CreatePaymentParams {
  amount: string;
  currency: PaymentCurrency;
  type?: PaymentType;
  settlementMethod?: SettlementMethod;
  settlementDestination: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface UsePaymentsReturn {
  // State
  isLoading: boolean;
  error: string | null;
  paymentIntent: PaymentIntent | null;
  
  // Actions
  createPayment: (params: CreatePaymentParams) => Promise<PaymentIntent | null>;
  getPaymentStatus: (paymentIntentId: string) => Promise<PaymentIntent | null>;
  cancelPayment: (paymentIntentId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

// ============================================
// HOOK
// ============================================

export function usePayments(): UsePaymentsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  /**
   * Creates a new payment intent
   */
  const createPayment = useCallback(async (params: CreatePaymentParams): Promise<PaymentIntent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate idempotency key to prevent duplicate charges
      const idempotencyKey = `payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const requestBody: CreatePaymentIntentRequest = {
        amount: params.amount,
        currency: params.currency,
        type: params.type || 'CONDITIONAL',
        settlementMethod: params.settlementMethod || 'OFF_RAMP_MOCK',
        settlementDestination: params.settlementDestination,
        description: params.description,
        metadata: params.metadata,
        idempotencyKey,
      };

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success && data.paymentIntent) {
        setPaymentIntent(data.paymentIntent);
        return data.paymentIntent;
      } else {
        const errorMessage = data.error || 'Failed to create payment';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Gets the status of a payment intent
   */
  const getPaymentStatus = useCallback(async (paymentIntentId: string): Promise<PaymentIntent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/status/${encodeURIComponent(paymentIntentId)}`);
      const data = await response.json();

      if (data.success && data.paymentIntent) {
        setPaymentIntent(data.paymentIntent);
        return data.paymentIntent;
      } else {
        const errorMessage = data.error || 'Failed to fetch payment status';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancels a payment intent
   */
  const cancelPayment = useCallback(async (paymentIntentId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/status/${encodeURIComponent(paymentIntentId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        if (data.paymentIntent) {
          setPaymentIntent(data.paymentIntent);
        }
        return true;
      } else {
        const errorMessage = data.error || 'Failed to cancel payment';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resets all state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setPaymentIntent(null);
  }, []);

  return {
    isLoading,
    error,
    paymentIntent,
    createPayment,
    getPaymentStatus,
    cancelPayment,
    clearError,
    reset,
  };
}

export default usePayments;
