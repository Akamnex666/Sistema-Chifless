/**
 * Webhook Event Interface
 * Standard format for webhook events
 */
export interface WebhookEvent {
  id: string;
  eventType: string;
  transactionId: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  timestamp: Date;
  provider: string;
  metadata?: Record<string, any>;
}

/**
 * Webhook Event Types
 */
export enum WebhookEventType {
  PAYMENT_CREATED = "payment.created",
  PAYMENT_CONFIRMED = "payment.confirmed",
  PAYMENT_FAILED = "payment.failed",
  PAYMENT_REFUNDED = "payment.refunded",
  PAYMENT_CANCELLED = "payment.cancelled",
}

/**
 * Webhook Dispatch Status
 */
export enum WebhookDispatchStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  RETRYING = "retrying",
  EXHAUSTED = "exhausted",
}
