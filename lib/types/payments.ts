/**
 * Finternet Payment API Types
 * Type definitions for payment gateway integration
 */

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const PAYMENT_CURRENCIES = ['USDC', 'USDT', 'ETH', 'BTC'] as const;
export type PaymentCurrency = typeof PAYMENT_CURRENCIES[number];

export const PAYMENT_TYPES = ['CONDITIONAL', 'IMMEDIATE', 'ESCROW'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

export const SETTLEMENT_METHODS = [
  'OFF_RAMP_MOCK',
  'OFF_RAMP_LIVE',
  'WALLET_TRANSFER',
  'BANK_TRANSFER'
] as const;
export type SettlementMethod = typeof SETTLEMENT_METHODS[number];

export const PAYMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'EXPIRED'
] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Request body for creating a payment intent
 */
export interface CreatePaymentIntentRequest {
  /** Payment amount as string (e.g., "10.00") */
  amount: string;
  /** Payment currency */
  currency: PaymentCurrency;
  /** Type of payment */
  type: PaymentType;
  /** Settlement method for the payment */
  settlementMethod: SettlementMethod;
  /** Destination account for settlement */
  settlementDestination: string;
  /** Optional metadata for the payment */
  metadata?: Record<string, string>;
  /** Optional description */
  description?: string;
  /** Optional idempotency key to prevent duplicate charges */
  idempotencyKey?: string;
}

/**
 * Request params for getting payment status
 */
export interface GetPaymentStatusRequest {
  /** Payment intent ID */
  paymentIntentId: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Payment intent object returned from Finternet API
 */
export interface PaymentIntent {
  /** Unique identifier for the payment intent */
  id: string;
  /** Payment amount */
  amount: string;
  /** Payment currency */
  currency: PaymentCurrency;
  /** Type of payment */
  type: PaymentType;
  /** Current status of the payment */
  status: PaymentStatus;
  /** Settlement method */
  settlementMethod: SettlementMethod;
  /** Settlement destination */
  settlementDestination: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Expiration timestamp */
  expiresAt?: string;
  /** Transaction hash if completed */
  transactionHash?: string;
  /** Any metadata attached */
  metadata?: Record<string, string>;
  /** Description */
  description?: string;
  /** Error message if failed */
  errorMessage?: string;
  /** Error code if failed */
  errorCode?: string;
}

/**
 * API response wrapper for payment intent creation
 */
export interface CreatePaymentIntentResponse {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  errorCode?: string;
}

/**
 * API response wrapper for payment status
 */
export interface GetPaymentStatusResponse {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  errorCode?: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Finternet API error codes
 */
export const FINTERNET_ERROR_CODES = {
  MISSING_API_KEY: 'MISSING_API_KEY',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_CURRENCY: 'INVALID_CURRENCY',
  INVALID_PAYMENT_TYPE: 'INVALID_PAYMENT_TYPE',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type FinternetErrorCode = typeof FINTERNET_ERROR_CODES[keyof typeof FINTERNET_ERROR_CODES];

/**
 * Error response from Finternet API
 */
export interface FinternetApiError {
  code: FinternetErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// FRONTEND TYPES
// ============================================

/**
 * Payment form state for frontend
 */
export interface PaymentFormState {
  amount: string;
  currency: PaymentCurrency;
  type: PaymentType;
  settlementDestination: string;
  description: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Payment status UI state
 */
export interface PaymentStatusState {
  paymentIntent: PaymentIntent | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates if a string is a valid payment amount
 */
export function isValidAmount(amount: string): boolean {
  const numericAmount = parseFloat(amount);
  return !isNaN(numericAmount) && numericAmount > 0 && /^\d+(\.\d{1,2})?$/.test(amount);
}

/**
 * Validates if currency is supported
 */
export function isValidCurrency(currency: string): currency is PaymentCurrency {
  return PAYMENT_CURRENCIES.includes(currency as PaymentCurrency);
}

/**
 * Validates if payment type is valid
 */
export function isValidPaymentType(type: string): type is PaymentType {
  return PAYMENT_TYPES.includes(type as PaymentType);
}

/**
 * Validates if settlement method is valid
 */
export function isValidSettlementMethod(method: string): method is SettlementMethod {
  return SETTLEMENT_METHODS.includes(method as SettlementMethod);
}
