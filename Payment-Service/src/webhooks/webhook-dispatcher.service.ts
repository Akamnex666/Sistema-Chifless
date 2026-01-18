import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  WebhookDispatch,
  WebhookStatus,
} from "../models/webhook-dispatch.entity";
import { Partner } from "../partners/partner.entity";
import { HmacUtils } from "../utils/hmac.utils";
import axios, { AxiosError } from "axios";

export interface WebhookEvent {
  event_type: string;
  transaction_id?: string;
  payload: Record<string, any>;
}

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);
  private readonly retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000, // 1 segundo
    maxDelayMs: 30000, // 30 segundos
  };

  constructor(
    @InjectRepository(WebhookDispatch)
    private dispatchRepository: Repository<WebhookDispatch>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  /**
   * Dispatch a webhook event to all subscribed partners
   */
  async dispatchEvent(event: WebhookEvent): Promise<void> {
    this.logger.debug(`Dispatching event: ${event.event_type}`);

    // Find all partners subscribed to this event
    const partners = await this.partnerRepository.find({
      where: { active: true },
    });

    const subscribedPartners = partners.filter(
      (p) =>
        p.events_subscribed && p.events_subscribed.includes(event.event_type),
    );

    this.logger.debug(
      `Found ${subscribedPartners.length} partners for event ${event.event_type}`,
    );

    // Create dispatch records for each partner
    for (const partner of subscribedPartners) {
      await this.createDispatchRecord(partner, event);
    }
  }

  /**
   * Create a dispatch record and attempt to send
   */
  private async createDispatchRecord(
    partner: Partner,
    event: WebhookEvent,
  ): Promise<void> {
    try {
      const signature = HmacUtils.generateSignature(
        event.payload,
        partner.hmac_secret,
      );

      const dispatch = this.dispatchRepository.create({
        partner_id: partner.id,
        event_type: event.event_type,
        transaction_id: event.transaction_id,
        payload: event.payload,
        webhook_url: partner.webhook_url,
        signature,
        status: WebhookStatus.PENDING,
        attempt_count: 0,
        max_attempts: this.retryConfig.maxAttempts,
      });

      await this.dispatchRepository.save(dispatch);

      // Attempt to send immediately
      await this.sendDispatch(dispatch);
    } catch (error) {
      this.logger.error(
        `Failed to create dispatch record: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send a webhook dispatch with retry logic
   */
  async sendDispatch(dispatch: WebhookDispatch): Promise<void> {
    dispatch.attempt_count++;
    dispatch.last_attempt_at = new Date();

    try {
      this.logger.debug(
        `Sending webhook to ${dispatch.webhook_url} (attempt ${dispatch.attempt_count}/${dispatch.max_attempts})`,
      );

      const response = await axios.post(
        dispatch.webhook_url,
        dispatch.payload,
        {
          headers: {
            "X-Webhook-Signature": dispatch.signature,
            "X-Event-Type": dispatch.event_type,
            "X-Attempt": dispatch.attempt_count.toString(),
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        },
      );

      if (response.status >= 200 && response.status < 300) {
        dispatch.status = WebhookStatus.SUCCESS;
        dispatch.http_status_code = response.status;
        this.logger.log(`Webhook sent successfully to ${dispatch.webhook_url}`);
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      dispatch.http_status_code = axiosError.response?.status || 0;
      dispatch.last_error = axiosError.message;

      if (dispatch.attempt_count < dispatch.max_attempts) {
        dispatch.status = WebhookStatus.RETRY;
        const delayMs = this.calculateRetryDelay(dispatch.attempt_count);
        dispatch.next_retry_at = new Date(Date.now() + delayMs);
        this.logger.warn(
          `Webhook dispatch failed, scheduling retry in ${delayMs}ms: ${error.message}`,
        );
      } else {
        dispatch.status = WebhookStatus.EXHAUSTED;
        this.logger.error(
          `Webhook dispatch exhausted all retry attempts: ${error.message}`,
        );
      }
    }

    await this.dispatchRepository.save(dispatch);
  }

  /**
   * Retry failed dispatches
   */
  async retryFailedDispatches(): Promise<void> {
    const now = new Date();
    const failedDispatches = await this.dispatchRepository.find({
      where: [
        { status: WebhookStatus.RETRY },
        { status: WebhookStatus.FAILED },
      ],
    });

    const readyForRetry = failedDispatches.filter(
      (d) => !d.next_retry_at || d.next_retry_at <= now,
    );

    this.logger.debug(
      `Found ${readyForRetry.length} dispatches ready for retry`,
    );

    for (const dispatch of readyForRetry) {
      await this.sendDispatch(dispatch);
    }
  }

  /**
   * Get dispatch history for a partner
   */
  async getDispatchHistory(
    partnerId: string,
    limit = 50,
  ): Promise<WebhookDispatch[]> {
    return this.dispatchRepository.find({
      where: { partner_id: partnerId },
      order: { created_at: "DESC" },
      take: limit,
    });
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateRetryDelay(attemptNumber: number): number {
    const exponentialDelay =
      this.retryConfig.baseDelayMs * Math.pow(2, attemptNumber - 1);
    return Math.min(exponentialDelay, this.retryConfig.maxDelayMs);
  }
}
