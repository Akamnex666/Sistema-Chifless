/**
 * PaymentProvider Interface
 * Define the contract for all payment provider implementations
 */
export interface IPaymentProvider {
  /**
   * Create a new payment
   * @param amount Payment amount in cents
   * @param currency Currency code (USD, EUR, etc.)
   * @param orderId Order identifier
   * @param metadata Additional payment metadata
   */
  createPayment(
    amount: number,
    currency: string,
    orderId: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse>;

  /**
   * Confirm a payment
   * @param transactionId The transaction ID to confirm
   * @param metadata Additional metadata
   */
  confirmPayment(
    transactionId: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse>;

  /**
   * Refund a payment
   * @param transactionId The transaction ID to refund
   * @param amount Optional refund amount (partial refunds)
   */
  refund(transactionId: string, amount?: number): Promise<PaymentResponse>;

  /**
   * Get payment status
   * @param transactionId The transaction ID
   */
  getPaymentStatus(transactionId: string): Promise<PaymentResponse>;
}

/**
 * Payment Response Standard Format
 */
export interface PaymentResponse {
  transactionId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund",
  CANCELLED = "cancelled",
}
