/**
 * Normaliza eventos de diferentes pasarelas de pago
 * Abstrae las diferencias entre proveedores (Mock, Stripe, etc)
 */

export enum PaymentEventType {
  CREATED = "payment.created",
  CONFIRMED = "payment.confirmed",
  FAILED = "payment.failed",
  REFUNDED = "payment.refunded",
}

export interface PaymentEventPayload {
  eventType: PaymentEventType;
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  customerId?: string;
  orderId?: string;
  description?: string;
  failureReason?: string;
  refundReason?: string;
}

export class PaymentEvent {
  private eventType: PaymentEventType;
  private paymentId: string;
  private transactionId: string;
  private amount: number;
  private currency: string;
  private status: string;
  private provider: string;
  private timestamp: Date;
  private metadata: Record<string, any>;

  constructor(payload: PaymentEventPayload) {
    this.eventType = payload.eventType;
    this.paymentId = payload.paymentId;
    this.transactionId = payload.transactionId;
    this.amount = payload.amount;
    this.currency = payload.currency;
    this.status = payload.status;
    this.provider = payload.provider;
    this.timestamp = payload.timestamp;
    this.metadata = {
      customerId: payload.customerId,
      orderId: payload.orderId,
      description: payload.description,
      failureReason: payload.failureReason,
      refundReason: payload.refundReason,
      ...payload.metadata,
    };
  }

  /**
   * Crea PaymentEvent desde respuesta de MockAdapter
   */
  static fromMockAdapter(mockResponse: any): PaymentEvent {
    const eventType =
      mockResponse.status === "completed"
        ? PaymentEventType.CONFIRMED
        : mockResponse.status === "failed"
          ? PaymentEventType.FAILED
          : PaymentEventType.CREATED;

    return new PaymentEvent({
      eventType,
      paymentId: mockResponse.paymentId,
      transactionId: mockResponse.transactionId,
      amount: mockResponse.amount,
      currency: mockResponse.currency || "USD",
      status: mockResponse.status,
      provider: "mock",
      timestamp: new Date(mockResponse.timestamp),
      metadata: mockResponse.metadata,
    });
  }

  /**
   * Crea PaymentEvent desde respuesta de Stripe (cuando esté implementado)
   */
  static fromStripeEvent(stripeEvent: any): PaymentEvent {
    const statusMap = {
      succeeded: "completed",
      failed: "failed",
      processing: "pending",
    };

    const eventType =
      stripeEvent.status === "succeeded"
        ? PaymentEventType.CONFIRMED
        : stripeEvent.status === "failed"
          ? PaymentEventType.FAILED
          : PaymentEventType.CREATED;

    return new PaymentEvent({
      eventType,
      paymentId: stripeEvent.id,
      transactionId: stripeEvent.id,
      amount: stripeEvent.amount / 100, // Stripe retorna en centavos
      currency: stripeEvent.currency?.toUpperCase() || "USD",
      status: statusMap[stripeEvent.status] || stripeEvent.status,
      provider: "stripe",
      timestamp: new Date(stripeEvent.created * 1000), // Stripe usa timestamp Unix
      customerId: stripeEvent.customer,
      description: stripeEvent.description,
      failureReason: stripeEvent.failure_message,
    });
  }

  /**
   * Serializa el evento para webhooks
   */
  toJSON(): PaymentEventPayload {
    return {
      eventType: this.eventType,
      paymentId: this.paymentId,
      transactionId: this.transactionId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      provider: this.provider,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }

  /**
   * Getters para acceso a propiedades
   */
  getEventType(): PaymentEventType {
    return this.eventType;
  }

  getPaymentId(): string {
    return this.paymentId;
  }

  getTransactionId(): string {
    return this.transactionId;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getStatus(): string {
    return this.status;
  }

  getProvider(): string {
    return this.provider;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getMetadata(): Record<string, any> {
    return this.metadata;
  }

  /**
   * Verifica si es evento de confirmación
   */
  isConfirmed(): boolean {
    return this.eventType === PaymentEventType.CONFIRMED;
  }

  /**
   * Verifica si es evento de fallo
   */
  isFailed(): boolean {
    return this.eventType === PaymentEventType.FAILED;
  }

  /**
   * Verifica si es evento de creación
   */
  isCreated(): boolean {
    return this.eventType === PaymentEventType.CREATED;
  }
}
