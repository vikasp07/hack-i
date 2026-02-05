/**
 * Create Payment Intent API Endpoint
 * POST /api/payments/create-intent
 * 
 * Creates a new payment intent via Finternet API
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createPaymentIntent,
  PaymentServiceError
} from '@/lib/services/payments';
import {
  CreatePaymentIntentRequest,
  PAYMENT_CURRENCIES,
  PAYMENT_TYPES,
  SETTLEMENT_METHODS,
} from '@/lib/types/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/create-intent
 * 
 * Request Body:
 * {
 *   amount: string,        // Required: Payment amount (e.g., "10.00")
 *   currency: string,      // Required: Currency code (USDC, USDT, ETH, BTC)
 *   type: string,          // Required: Payment type (CONDITIONAL, IMMEDIATE, ESCROW)
 *   settlementMethod: string,      // Required: Settlement method
 *   settlementDestination: string, // Required: Destination account
 *   description?: string,          // Optional: Payment description
 *   metadata?: object              // Optional: Additional metadata
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: Partial<CreatePaymentIntentRequest>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          errorCode: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const missingFields: string[] = [];
    if (!body.amount) missingFields.push('amount');
    if (!body.currency) missingFields.push('currency');
    if (!body.type) missingFields.push('type');
    if (!body.settlementMethod) missingFields.push('settlementMethod');
    if (!body.settlementDestination) missingFields.push('settlementDestination');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          errorCode: 'MISSING_FIELDS',
          requiredFields: {
            amount: 'Payment amount as string (e.g., "10.00")',
            currency: `Currency code (${PAYMENT_CURRENCIES.join(', ')})`,
            type: `Payment type (${PAYMENT_TYPES.join(', ')})`,
            settlementMethod: `Settlement method (${SETTLEMENT_METHODS.join(', ')})`,
            settlementDestination: 'Destination account identifier',
          },
        },
        { status: 400 }
      );
    }

    // Create payment intent via service
    const result = await createPaymentIntent({
      amount: body.amount!,
      currency: body.currency!,
      type: body.type!,
      settlementMethod: body.settlementMethod!,
      settlementDestination: body.settlementDestination!,
      description: body.description,
      metadata: body.metadata,
      idempotencyKey: request.headers.get('Idempotency-Key') || undefined,
    });

    // Return response
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          paymentIntent: result.paymentIntent,
          timestamp: new Date().toISOString(),
        },
        { 
          status: 201,
          headers: {
            'Cache-Control': 'no-store',
          }
        }
      );
    } else {
      // Map error codes to HTTP status codes
      let statusCode = 400;
      if (result.errorCode === 'MISSING_API_KEY' || result.errorCode === 'INVALID_API_KEY') {
        statusCode = 401;
      } else if (result.errorCode === 'RATE_LIMIT_EXCEEDED') {
        statusCode = 429;
      } else if (result.errorCode === 'INTERNAL_ERROR' || result.errorCode === 'NETWORK_ERROR') {
        statusCode = 500;
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorCode: result.errorCode,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('[API] Payment intent creation error:', error);

    // Handle known errors
    if (error instanceof PaymentServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/create-intent
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/payments/create-intent',
    method: 'POST',
    description: 'Create a new payment intent',
    requestBody: {
      amount: {
        type: 'string',
        required: true,
        description: 'Payment amount (e.g., "10.00")',
        example: '10.00',
      },
      currency: {
        type: 'string',
        required: true,
        description: 'Payment currency',
        enum: PAYMENT_CURRENCIES,
      },
      type: {
        type: 'string',
        required: true,
        description: 'Payment type',
        enum: PAYMENT_TYPES,
      },
      settlementMethod: {
        type: 'string',
        required: true,
        description: 'Settlement method',
        enum: SETTLEMENT_METHODS,
      },
      settlementDestination: {
        type: 'string',
        required: true,
        description: 'Settlement destination account',
        example: 'test_account',
      },
      description: {
        type: 'string',
        required: false,
        description: 'Optional payment description',
      },
      metadata: {
        type: 'object',
        required: false,
        description: 'Optional metadata key-value pairs',
      },
    },
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': '(optional) Unique key to prevent duplicate charges',
    },
    responses: {
      201: 'Payment intent created successfully',
      400: 'Invalid request or validation error',
      401: 'Missing or invalid API key',
      429: 'Rate limit exceeded',
      500: 'Internal server error',
    },
  });
}
