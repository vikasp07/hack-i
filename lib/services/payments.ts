/**
 * Finternet Payment Service
 * Handles all communication with Finternet Payment API
 * 
 * API Base URL: https://api.fmm.finternetlab.io/v1
 * Authentication: X-API-Key header
 */

import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  GetPaymentStatusResponse,
  PaymentIntent,
  FinternetApiError,
  FINTERNET_ERROR_CODES,
  isValidAmount,
  isValidCurrency,
  isValidPaymentType,
  isValidSettlementMethod,
} from '@/lib/types/payments';

// ============================================
// CONFIGURATION
// ============================================

const FINTERNET_API_BASE_URL = 'https://api.fmm.finternetlab.io/v1';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Gets the Finternet API key from environment variables
 * @throws Error if API key is not configured
 */
function getApiKey(): string {
  const apiKey = process.env.FINTERNET_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'FINTERNET_API_KEY is not configured. Please add it to your .env file.'
    );
  }
  
  return apiKey;
}

/**
 * Determines if we're in test mode based on API key prefix
 */
export function isTestMode(): boolean {
  try {
    const apiKey = getApiKey();
    return apiKey.startsWith('sk_test_');
  } catch {
    return true; // Default to test mode if no key
  }
}

// ============================================
// HTTP CLIENT
// ============================================

interface FinternetRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: Record<string, unknown>;
  timeout?: number;
  idempotencyKey?: string;
}

/**
 * Makes an authenticated request to the Finternet API
 */
async function finternetRequest<T>(options: FinternetRequestOptions): Promise<T> {
  const { method, endpoint, body, timeout = DEFAULT_TIMEOUT, idempotencyKey } = options;
  
  const apiKey = getApiKey();
  const url = `${FINTERNET_API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  };
  
  // Add idempotency key for POST requests if provided
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Parse response
    const responseData = await response.json().catch(() => null);
    
    // Handle errors
    if (!response.ok) {
      throw createApiError(response.status, responseData);
    }
    
    return responseData as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new PaymentServiceError(
          FINTERNET_ERROR_CODES.NETWORK_ERROR,
          'Request timeout - please try again'
        );
      }
      throw error;
    }
    
    throw new PaymentServiceError(
      FINTERNET_ERROR_CODES.NETWORK_ERROR,
      'Network error occurred'
    );
  }
}

/**
 * Creates an appropriate error from API response
 */
function createApiError(status: number, responseData: Record<string, unknown> | null): PaymentServiceError {
  switch (status) {
    case 401:
      return new PaymentServiceError(
        FINTERNET_ERROR_CODES.MISSING_API_KEY,
        'API key is missing or invalid'
      );
    case 403:
      return new PaymentServiceError(
        FINTERNET_ERROR_CODES.INVALID_API_KEY,
        'API key is invalid or does not have permission'
      );
    case 404:
      return new PaymentServiceError(
        FINTERNET_ERROR_CODES.PAYMENT_NOT_FOUND,
        'Payment not found'
      );
    case 429:
      return new PaymentServiceError(
        FINTERNET_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded - please try again later'
      );
    default:
      const message = (responseData?.message as string) || 
                      (responseData?.error as string) || 
                      `API error: ${status}`;
      return new PaymentServiceError(
        FINTERNET_ERROR_CODES.INTERNAL_ERROR,
        message
      );
  }
}

// ============================================
// ERROR CLASS
// ============================================

/**
 * Custom error class for payment service errors
 */
export class PaymentServiceError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'PaymentServiceError';
    this.code = code;
    this.details = details;
  }
  
  toJSON(): FinternetApiError {
    return {
      code: this.code as FinternetApiError['code'],
      message: this.message,
      details: this.details,
    };
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validates payment intent request data
 */
function validateCreatePaymentIntentRequest(data: CreatePaymentIntentRequest): void {
  // Validate amount
  if (!data.amount || !isValidAmount(data.amount)) {
    throw new PaymentServiceError(
      FINTERNET_ERROR_CODES.INVALID_AMOUNT,
      'Invalid amount. Must be a positive number with up to 2 decimal places.'
    );
  }
  
  // Validate currency
  if (!data.currency || !isValidCurrency(data.currency)) {
    throw new PaymentServiceError(
      FINTERNET_ERROR_CODES.INVALID_CURRENCY,
      `Invalid currency. Supported currencies: USDC, USDT, ETH, BTC`
    );
  }
  
  // Validate payment type
  if (!data.type || !isValidPaymentType(data.type)) {
    throw new PaymentServiceError(
      FINTERNET_ERROR_CODES.INVALID_PAYMENT_TYPE,
      'Invalid payment type. Must be CONDITIONAL, IMMEDIATE, or ESCROW'
    );
  }
  
  // Validate settlement method
  if (!data.settlementMethod || !isValidSettlementMethod(data.settlementMethod)) {
    throw new PaymentServiceError(
      FINTERNET_ERROR_CODES.INVALID_PAYMENT_TYPE,
      'Invalid settlement method'
    );
  }
  
  // Validate settlement destination
  if (!data.settlementDestination || data.settlementDestination.trim().length === 0) {
    throw new PaymentServiceError(
      FINTERNET_ERROR_CODES.INVALID_PAYMENT_TYPE,
      'Settlement destination is required'
    );
  }
}

// ============================================
// RETRY LOGIC
// ============================================

/**
 * Executes a function with retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (error instanceof PaymentServiceError) {
        const nonRetryableCodes = [
          FINTERNET_ERROR_CODES.MISSING_API_KEY,
          FINTERNET_ERROR_CODES.INVALID_API_KEY,
          FINTERNET_ERROR_CODES.INVALID_AMOUNT,
          FINTERNET_ERROR_CODES.INVALID_CURRENCY,
          FINTERNET_ERROR_CODES.INVALID_PAYMENT_TYPE,
          FINTERNET_ERROR_CODES.PAYMENT_NOT_FOUND,
        ];
        
        if (nonRetryableCodes.includes(error.code as typeof nonRetryableCodes[number])) {
          throw error;
        }
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const backoffDelay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${backoffDelay}ms`);
      }
    }
  }
  
  throw lastError;
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Creates a new payment intent
 * 
 * @param data - Payment intent creation data
 * @returns Created payment intent
 */
export async function createPaymentIntent(
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  console.log('[PaymentService] Creating payment intent:', { 
    amount: data.amount, 
    currency: data.currency,
    type: data.type,
    isTestMode: isTestMode()
  });
  
  try {
    // Validate request data
    validateCreatePaymentIntentRequest(data);
    
    // Make API request with retry logic
    const paymentIntent = await withRetry(() =>
      finternetRequest<PaymentIntent>({
        method: 'POST',
        endpoint: '/payment-intents',
        body: {
          amount: data.amount,
          currency: data.currency,
          type: data.type,
          settlementMethod: data.settlementMethod,
          settlementDestination: data.settlementDestination,
          ...(data.metadata && { metadata: data.metadata }),
          ...(data.description && { description: data.description }),
        },
        idempotencyKey: data.idempotencyKey,
      })
    );
    
    console.log('[PaymentService] Payment intent created:', paymentIntent.id);
    
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('[PaymentService] Failed to create payment intent:', error);
    
    if (error instanceof PaymentServiceError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode: FINTERNET_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Gets the status of a payment intent
 * 
 * @param paymentIntentId - The payment intent ID to check
 * @returns Payment intent with current status
 */
export async function getPaymentStatus(
  paymentIntentId: string
): Promise<GetPaymentStatusResponse> {
  console.log('[PaymentService] Getting payment status:', paymentIntentId);
  
  if (!paymentIntentId || paymentIntentId.trim().length === 0) {
    return {
      success: false,
      error: 'Payment intent ID is required',
      errorCode: FINTERNET_ERROR_CODES.PAYMENT_NOT_FOUND,
    };
  }
  
  try {
    const paymentIntent = await withRetry(() =>
      finternetRequest<PaymentIntent>({
        method: 'GET',
        endpoint: `/payment-intents/${encodeURIComponent(paymentIntentId)}`,
      })
    );
    
    console.log('[PaymentService] Payment status:', paymentIntent.status);
    
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('[PaymentService] Failed to get payment status:', error);
    
    if (error instanceof PaymentServiceError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode: FINTERNET_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Cancels a payment intent
 * 
 * @param paymentIntentId - The payment intent ID to cancel
 * @returns Updated payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<GetPaymentStatusResponse> {
  console.log('[PaymentService] Cancelling payment intent:', paymentIntentId);
  
  if (!paymentIntentId || paymentIntentId.trim().length === 0) {
    return {
      success: false,
      error: 'Payment intent ID is required',
      errorCode: FINTERNET_ERROR_CODES.PAYMENT_NOT_FOUND,
    };
  }
  
  try {
    const paymentIntent = await withRetry(() =>
      finternetRequest<PaymentIntent>({
        method: 'POST',
        endpoint: `/payment-intents/${encodeURIComponent(paymentIntentId)}/cancel`,
      })
    );
    
    console.log('[PaymentService] Payment cancelled:', paymentIntent.status);
    
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('[PaymentService] Failed to cancel payment:', error);
    
    if (error instanceof PaymentServiceError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode: FINTERNET_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { FINTERNET_ERROR_CODES };
