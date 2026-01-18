import { Injectable } from "@nestjs/common";
import {
  IPaymentProvider,
  PaymentResponse,
  PaymentStatus,
} from "../providers/payment.provider";

/**
 * Mock Payment Adapter
 * Simulates payment provider for testing and development
 */
@Injectable()
export class MockPaymentAdapter implements IPaymentProvider {
  async createPayment(
    amount: number,
    currency: string,
    orderId: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse> {
    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      transactionId,
      orderId,
      status: PaymentStatus.COMPLETED,
      amount,
      currency,
      provider: "mock",
      timestamp: new Date(),
      metadata,
    };
  }

  async confirmPayment(
    transactionId: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentResponse> {
    return {
      transactionId,
      orderId: "unknown",
      status: PaymentStatus.COMPLETED,
      amount: 0,
      currency: "USD",
      provider: "mock",
      timestamp: new Date(),
      metadata,
    };
  }

  async refund(
    transactionId: string,
    amount?: number,
  ): Promise<PaymentResponse> {
    return {
      transactionId,
      orderId: "unknown",
      status: amount ? PaymentStatus.PARTIAL_REFUND : PaymentStatus.REFUNDED,
      amount: amount || 0,
      currency: "USD",
      provider: "mock",
      timestamp: new Date(),
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    return {
      transactionId,
      orderId: "unknown",
      status: PaymentStatus.COMPLETED,
      amount: 0,
      currency: "USD",
      provider: "mock",
      timestamp: new Date(),
    };
  }
}
