import { IsString, IsObject, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReceiveWebhookDto {
  @ApiProperty({
    example: "payment.confirmed",
    description: "Type of webhook event",
  })
  @IsString()
  event_type: string;

  @ApiProperty({
    example: "txn_123456789",
    description: "Transaction ID from partner",
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiProperty({
    example: { orderId: "123", amount: 100.5, status: "completed" },
    description: "Webhook payload",
  })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({
    example: "abc123def456...",
    description: "HMAC signature for verification",
  })
  @IsString()
  signature: string;
}

export class WebhookAckDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  received_at: string;

  @ApiProperty()
  event_id?: string;
}

export class WebhookErrorDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  error: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  timestamp: string;
}
