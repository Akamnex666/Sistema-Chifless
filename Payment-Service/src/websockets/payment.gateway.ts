import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  namespace: "payments",
})
export class PaymentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger("PaymentGateway");

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emite notificación de pago confirmado a todos los clientes
   * Se dispara desde PaymentService al confirmar un pago
   */
  notifyPaymentConfirmed(paymentData: {
    paymentId: string;
    transactionId: string;
    amount: number;
    currency: string;
    orderId?: string;
    customerId?: string;
    timestamp: Date;
  }) {
    this.logger.log(
      `Broadcasting payment.confirmed: ${paymentData.transactionId}`,
    );
    this.server.emit("payment.confirmed", {
      event: "payment.confirmed",
      data: paymentData,
      timestamp: new Date(),
    });
  }

  /**
   * Emite notificación de pago fallido
   */
  notifyPaymentFailed(paymentData: {
    paymentId: string;
    transactionId: string;
    orderId?: string;
    customerId?: string;
    failureReason: string;
    timestamp: Date;
  }) {
    this.logger.log(
      `Broadcasting payment.failed: ${paymentData.transactionId}`,
    );
    this.server.emit("payment.failed", {
      event: "payment.failed",
      data: paymentData,
      timestamp: new Date(),
    });
  }

  /**
   * Emite notificación de webhook enviado a partner
   */
  notifyWebhookDispatched(dispatchData: {
    partnerId: string;
    eventType: string;
    paymentId: string;
    status: string;
    attempt: number;
    timestamp: Date;
  }) {
    this.logger.log(
      `Broadcasting webhook.dispatched to partner: ${dispatchData.partnerId}`,
    );
    this.server.emit("webhook.dispatched", {
      event: "webhook.dispatched",
      data: dispatchData,
      timestamp: new Date(),
    });
  }

  /**
   * Emite notificación de evento recibido desde partner
   */
  notifyWebhookReceived(eventData: {
    eventId: string;
    eventType: string;
    sourcePartner: string;
    status: string;
    timestamp: Date;
  }) {
    this.logger.log(
      `Broadcasting webhook.received from partner: ${eventData.sourcePartner}`,
    );
    this.server.emit("webhook.received", {
      event: "webhook.received",
      data: eventData,
      timestamp: new Date(),
    });
  }

  /**
   * Emite notificación genérica de estado
   */
  notifyStatusUpdate(statusData: {
    type: string;
    message: string;
    level: "info" | "warning" | "error";
    metadata?: Record<string, any>;
  }) {
    this.logger.log(`Broadcasting status.update: ${statusData.message}`);
    this.server.emit("status.update", {
      event: "status.update",
      data: statusData,
      timestamp: new Date(),
    });
  }
}
