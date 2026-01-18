import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Partner } from "../partners/partner.entity";
import { HmacUtils } from "../utils/hmac.utils";
import { ReceiveWebhookDto } from "./webhook.dto";

export interface ProcessedWebhook {
  success: boolean;
  message: string;
  eventId: string;
  processedAt: Date;
}

@Injectable()
export class WebhookReceiverService {
  private readonly logger = new Logger(WebhookReceiverService.name);

  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  /**
   * Process incoming webhook from a partner
   * 1. Verify HMAC signature
   * 2. Validate event structure
   * 3. Process based on event type
   * 4. Return ACK
   */
  async processWebhook(
    webhookData: ReceiveWebhookDto,
    partnerSecret: string,
  ): Promise<ProcessedWebhook> {
    const eventId = this.generateEventId();

    try {
      this.logger.debug(
        `Processing webhook ${eventId} for event: ${webhookData.event_type}`,
      );

      // Step 1: Verify HMAC signature
      this.verifyWebhookSignature(webhookData, partnerSecret);

      // Step 2: Validate event structure
      this.validateEventStructure(webhookData);

      // Step 3: Process based on event type
      await this.processEventByType(webhookData, eventId);

      this.logger.log(
        `Webhook ${eventId} processed successfully: ${webhookData.event_type}`,
      );

      return {
        success: true,
        message: `Webhook ${webhookData.event_type} received and processed`,
        eventId,
        processedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error processing webhook ${eventId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verify webhook signature using partner's secret
   */
  private verifyWebhookSignature(
    webhookData: ReceiveWebhookDto,
    partnerSecret: string,
  ): void {
    try {
      const isValid = HmacUtils.verifySignature(
        webhookData.payload,
        webhookData.signature,
        partnerSecret,
      );

      if (!isValid) {
        throw new UnauthorizedException(
          "Webhook signature verification failed",
        );
      }

      this.logger.debug("Webhook signature verified successfully");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        `Signature verification error: ${error.message}`,
      );
    }
  }

  /**
   * Validate webhook event structure
   */
  private validateEventStructure(webhookData: ReceiveWebhookDto): void {
    if (!webhookData.event_type || typeof webhookData.event_type !== "string") {
      throw new BadRequestException(
        "event_type is required and must be a string",
      );
    }

    if (!webhookData.payload || typeof webhookData.payload !== "object") {
      throw new BadRequestException(
        "payload is required and must be an object",
      );
    }

    if (!webhookData.signature || typeof webhookData.signature !== "string") {
      throw new BadRequestException(
        "signature is required and must be a string",
      );
    }

    this.logger.debug("Event structure validation passed");
  }

  /**
   * Process webhook based on event type
   * This is where we handle different event types from partners
   */
  private async processEventByType(
    webhookData: ReceiveWebhookDto,
    eventId: string,
  ): Promise<void> {
    const { event_type, payload } = webhookData;

    this.logger.debug(`Processing event type: ${event_type}`);

    switch (event_type) {
      case "order.created":
        await this.handleOrderCreated(payload, eventId);
        break;

      case "order.updated":
        await this.handleOrderUpdated(payload, eventId);
        break;

      case "order.completed":
        await this.handleOrderCompleted(payload, eventId);
        break;

      case "inventory.updated":
        await this.handleInventoryUpdated(payload, eventId);
        break;

      case "customer.registered":
        await this.handleCustomerRegistered(payload, eventId);
        break;

      default:
        this.logger.warn(
          `Unknown event type: ${event_type}, storing for analysis`,
        );
        await this.handleUnknownEvent(payload, event_type, eventId);
    }
  }

  /**
   * Handle order.created event
   */
  private async handleOrderCreated(
    payload: Record<string, any>,
    eventId: string,
  ): Promise<void> {
    this.logger.log(
      `[${eventId}] Processing order.created: orderId=${payload.orderId}`,
    );
    // TODO: Implement business logic
    // - Validate order data
    // - Create order in system if needed
    // - Send notification
  }

  /**
   * Handle order.updated event
   */
  private async handleOrderUpdated(
    payload: Record<string, any>,
    eventId: string,
  ): Promise<void> {
    this.logger.log(
      `[${eventId}] Processing order.updated: orderId=${payload.orderId}`,
    );
    // TODO: Implement business logic
    // - Update order status
    // - Trigger notifications
  }

  /**
   * Handle order.completed event
   */
  private async handleOrderCompleted(
    payload: Record<string, any>,
    eventId: string,
  ): Promise<void> {
    this.logger.log(
      `[${eventId}] Processing order.completed: orderId=${payload.orderId}`,
    );
    // TODO: Implement business logic
    // - Mark order as completed
    // - Generate invoice if needed
    // - Send confirmation email
  }

  /**
   * Handle inventory.updated event
   */
  private async handleInventoryUpdated(
    payload: Record<string, any>,
    eventId: string,
  ): Promise<void> {
    this.logger.log(
      `[${eventId}] Processing inventory.updated: productId=${payload.productId}`,
    );
    // TODO: Implement business logic
    // - Update product inventory
    // - Check stock levels
    // - Alert if low stock
  }

  /**
   * Handle customer.registered event
   */
  private async handleCustomerRegistered(
    payload: Record<string, any>,
    eventId: string,
  ): Promise<void> {
    this.logger.log(
      `[${eventId}] Processing customer.registered: customerId=${payload.customerId}`,
    );
    // TODO: Implement business logic
    // - Register customer in system
    // - Send welcome email
    // - Create user account if needed
  }

  /**
   * Handle unknown/unregistered event types
   */
  private async handleUnknownEvent(
    payload: Record<string, any>,
    eventType: string,
    eventId: string,
  ): Promise<void> {
    this.logger.warn(`[${eventId}] Storing unknown event type: ${eventType}`);
    // Store for later analysis or implement custom handlers
    // Could be extended in the future
  }

  /**
   * Find partner by webhook URL
   */
  async findPartnerByWebhookUrl(webhookUrl: string): Promise<Partner | null> {
    return this.partnerRepository.findOne({
      where: { webhook_url: webhookUrl, active: true },
    });
  }

  /**
   * Get partner's HMAC secret
   */
  async getPartnerSecret(partnerId: string): Promise<string | null> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });
    return partner?.hmac_secret || null;
  }

  /**
   * Generate unique event ID for tracking
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
