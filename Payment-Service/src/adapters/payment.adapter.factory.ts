// Payment Adapter Factory
// Factory pattern to select payment provider

import { MockPaymentAdapter } from "./mock-payment.adapter";
import { IPaymentProvider } from "../providers/payment.provider";

export class PaymentAdapterFactory {
  static createAdapter(provider: string): IPaymentProvider {
    switch (provider.toLowerCase()) {
      case "stripe":
        throw new Error("Stripe adapter not yet implemented");
      case "mock":
      default:
        return new MockPaymentAdapter();
    }
  }
}
