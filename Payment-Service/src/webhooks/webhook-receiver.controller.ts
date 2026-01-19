import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { WebhookReceiverService } from "./webhook-receiver.service";
import {
  ReceiveWebhookDto,
  WebhookAckDto,
  WebhookErrorDto,
} from "./webhook.dto";

@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhookReceiverController {
  private readonly logger = new Logger(WebhookReceiverController.name);

  constructor(private webhookReceiverService: WebhookReceiverService) {}

  @Post("receive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Receive webhook from partner",
    description:
      "Endpoint to receive and process webhooks from registered partners. Verifies HMAC signature and processes event.",
  })
  @ApiHeader({
    name: "X-Webhook-Signature",
    description: "HMAC-SHA256 signature of the payload",
    required: true,
  })
  @ApiHeader({
    name: "X-Partner-Id",
    description: "Partner ID (UUID)",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Webhook received and processed successfully",
    type: WebhookAckDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid webhook payload or missing required fields",
    type: WebhookErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: "HMAC signature verification failed or invalid partner",
    type: WebhookErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: WebhookErrorDto,
  })
  async receiveWebhook(
    @Body() webhookData: ReceiveWebhookDto,
    @Headers("X-Partner-Id") partnerId: string,
    @Headers("X-Webhook-Signature") signature: string,
  ): Promise<WebhookAckDto> {
    try {
      this.logger.debug(`Received webhook from partner: ${partnerId}`);

      // Validate headers
      if (!partnerId) {
        throw new BadRequestException("X-Partner-Id header is required");
      }

      if (!signature) {
        throw new BadRequestException("X-Webhook-Signature header is required");
      }

      // Get partner's HMAC secret
      const partnerSecret =
        await this.webhookReceiverService.getPartnerSecret(partnerId);

      if (!partnerSecret) {
        throw new UnauthorizedException(
          `Partner ${partnerId} not found or inactive`,
        );
      }

      // Update signature in webhook data from header
      const webhookWithSignature = {
        ...webhookData,
        signature,
      };

      // Process webhook
      const result = await this.webhookReceiverService.processWebhook(
        webhookWithSignature,
        partnerSecret,
      );

      return {
        success: true,
        message: result.message,
        received_at: result.processedAt.toISOString(),
        event_id: result.eventId,
      };
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Webhook processing failed: ${error.message}`,
      );
    }
  }

  /**
   * Alternative endpoint that accepts signature in body
   * Useful for clients that cannot set custom headers
   */
  @Post("receive-body")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Receive webhook with signature in body",
    description:
      "Alternative endpoint where signature is included in request body instead of header",
  })
  @ApiResponse({
    status: 200,
    description: "Webhook received and processed successfully",
    type: WebhookAckDto,
  })
  async receiveWebhookWithBodySignature(
    @Body()
    body: ReceiveWebhookDto & {
      partner_id: string;
    },
  ): Promise<WebhookAckDto> {
    try {
      const { partner_id, ...webhookData } = body;

      if (!partner_id) {
        throw new BadRequestException("partner_id is required");
      }

      if (!webhookData.signature) {
        throw new BadRequestException("signature is required");
      }

      const partnerSecret =
        await this.webhookReceiverService.getPartnerSecret(partner_id);

      if (!partnerSecret) {
        throw new UnauthorizedException(
          `Partner ${partner_id} not found or inactive`,
        );
      }

      const result = await this.webhookReceiverService.processWebhook(
        webhookData,
        partnerSecret,
      );

      return {
        success: true,
        message: result.message,
        received_at: result.processedAt.toISOString(),
        event_id: result.eventId,
      };
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Webhook processing failed: ${error.message}`,
      );
    }
  }
}
