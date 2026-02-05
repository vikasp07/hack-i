'use client';

/**
 * Payment Status Component
 * Displays the status of a payment with polling support
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type { PaymentIntent, PaymentStatus as PaymentStatusType } from '@/lib/types/payments';

// ============================================
// TYPES
// ============================================

interface PaymentStatusProps {
  /** Payment intent ID to track */
  paymentIntentId: string;
  /** Enable automatic polling */
  enablePolling?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Callback when status changes */
  onStatusChange?: (status: PaymentStatusType) => void;
  /** Callback when payment completes */
  onComplete?: (paymentIntent: PaymentIntent) => void;
  /** Callback when payment fails */
  onError?: (error: string) => void;
  /** Custom class name */
  className?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusColor(status: PaymentStatusType): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-red-500';
    case 'PROCESSING':
      return 'bg-blue-500';
    case 'PENDING':
      return 'bg-yellow-500';
    case 'EXPIRED':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
}

function getStatusIcon(status: PaymentStatusType) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'FAILED':
    case 'CANCELLED':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'PROCESSING':
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'EXPIRED':
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

// ============================================
// COMPONENT
// ============================================

export function PaymentStatus({
  paymentIntentId,
  enablePolling = true,
  pollingInterval = 5000,
  onStatusChange,
  onComplete,
  onError,
  className,
}: PaymentStatusProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(enablePolling);
  const [copied, setCopied] = useState(false);
  const [lastStatus, setLastStatus] = useState<PaymentStatusType | null>(null);

  // Fetch payment status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/payments/status/${encodeURIComponent(paymentIntentId)}`);
      const data = await response.json();

      if (data.success && data.paymentIntent) {
        setPaymentIntent(data.paymentIntent);
        setError(null);

        // Check for status change
        if (lastStatus !== null && data.paymentIntent.status !== lastStatus) {
          onStatusChange?.(data.paymentIntent.status);
        }
        setLastStatus(data.paymentIntent.status);

        // Check for completion
        if (data.paymentIntent.status === 'COMPLETED') {
          setIsPolling(false);
          onComplete?.(data.paymentIntent);
        }

        // Check for failure
        if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(data.paymentIntent.status)) {
          setIsPolling(false);
          onError?.(data.paymentIntent.errorMessage || 'Payment failed');
        }
      } else {
        setError(data.error || 'Failed to fetch payment status');
        onError?.(data.error || 'Failed to fetch payment status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [paymentIntentId, lastStatus, onStatusChange, onComplete, onError]);

  // Initial fetch and polling
  useEffect(() => {
    fetchStatus();

    if (enablePolling && isPolling) {
      const interval = setInterval(fetchStatus, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, enablePolling, isPolling, pollingInterval]);

  // Copy to clipboard
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(paymentIntentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    fetchStatus();
  };

  // Loading skeleton
  if (isLoading && !paymentIntent) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !paymentIntent) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Payment Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!paymentIntent) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(paymentIntent.status)}
            <CardTitle>Payment Status</CardTitle>
          </div>
          <Badge className={`${getStatusColor(paymentIntent.status)} text-white`}>
            {paymentIntent.status}
          </Badge>
        </div>
        <CardDescription>
          Track your payment progress
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment ID */}
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div>
            <p className="text-sm text-muted-foreground">Payment ID</p>
            <p className="font-mono text-sm truncate max-w-[200px]">
              {paymentIntent.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyId}
            aria-label="Copy payment ID"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-lg font-semibold">
              {paymentIntent.amount} {paymentIntent.currency}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">
              {paymentIntent.type.charAt(0) + paymentIntent.type.slice(1).toLowerCase()}
            </p>
          </div>
        </div>

        {/* Settlement Info */}
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Settlement Method</span>
            <span className="text-sm">{paymentIntent.settlementMethod.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Destination</span>
            <span className="text-sm font-mono">{paymentIntent.settlementDestination}</span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDate(paymentIntent.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span>{formatDate(paymentIntent.updatedAt)}</span>
          </div>
          {paymentIntent.expiresAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span>{formatDate(paymentIntent.expiresAt)}</span>
            </div>
          )}
        </div>

        {/* Transaction Hash (if completed) */}
        {paymentIntent.transactionHash && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 space-y-1">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Transaction Complete
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-green-600 dark:text-green-400 truncate">
                {paymentIntent.transactionHash}
              </span>
              <Button variant="ghost" size="icon-sm" asChild>
                <a
                  href={`https://explorer.finternetlab.io/tx/${paymentIntent.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View transaction"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Error Message (if failed) */}
        {paymentIntent.errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              {paymentIntent.errorMessage}
              {paymentIntent.errorCode && (
                <span className="block text-xs mt-1">
                  Error code: {paymentIntent.errorCode}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Polling Indicator */}
        {isPolling && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Auto-refreshing every {pollingInterval / 1000}s</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
        <Button
          variant={isPolling ? 'secondary' : 'default'}
          onClick={() => setIsPolling(!isPolling)}
          disabled={['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(paymentIntent.status)}
          className="flex-1"
        >
          {isPolling ? 'Stop Polling' : 'Start Polling'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PaymentStatus;
