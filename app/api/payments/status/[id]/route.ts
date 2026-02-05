/**
 * Payment Status API Endpoint
 * GET /api/payments/status/:id
 * 
 * Retrieves the status of a payment intent
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getPaymentStatus,
  cancelPaymentIntent,
  PaymentServiceError
} from '@/lib/services/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/payments/status/:id
 * 
 * Retrieves the current status of a payment intent
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: paymentIntentId } = await params;

    // Validate payment intent ID
    if (!paymentIntentId || paymentIntentId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment intent ID is required',
          errorCode: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    // Get payment status via service
    const result = await getPaymentStatus(paymentIntentId);

    // Return response
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          paymentIntent: result.paymentIntent,
          timestamp: new Date().toISOString(),
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          }
        }
      );
    } else {
      // Map error codes to HTTP status codes
      let statusCode = 400;
      if (result.errorCode === 'PAYMENT_NOT_FOUND') {
        statusCode = 404;
      } else if (result.errorCode === 'MISSING_API_KEY' || result.errorCode === 'INVALID_API_KEY') {
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
    console.error('[API] Payment status retrieval error:', error);

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
 * DELETE /api/payments/status/:id
 * 
 * Cancels a payment intent
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: paymentIntentId } = await params;

    // Validate payment intent ID
    if (!paymentIntentId || paymentIntentId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment intent ID is required',
          errorCode: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    // Cancel payment via service
    const result = await cancelPaymentIntent(paymentIntentId);

    // Return response
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          paymentIntent: result.paymentIntent,
          message: 'Payment intent cancelled successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      // Map error codes to HTTP status codes
      let statusCode = 400;
      if (result.errorCode === 'PAYMENT_NOT_FOUND') {
        statusCode = 404;
      } else if (result.errorCode === 'MISSING_API_KEY' || result.errorCode === 'INVALID_API_KEY') {
        statusCode = 401;
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
    console.error('[API] Payment cancellation error:', error);

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
