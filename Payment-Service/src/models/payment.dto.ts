/**
 * Create Payment Request DTO
 */
export class CreatePaymentDto {
  orderId: string;
  amount: number;
  currency: string;
  provider?: string; // 'mock' or 'stripe', defaults to 'mock'
  metadata?: Record<string, any>;
}

/**
 * Payment Response DTO
 */
export class PaymentResponseDto {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
