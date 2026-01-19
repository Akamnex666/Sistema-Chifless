import { IsString, IsUrl, IsOptional, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterPartnerDto {
  @ApiProperty({ example: "n8n", description: "Partner name" })
  @IsString()
  name: string;

  @ApiProperty({
    example: "https://n8n.example.com/webhook/payments",
    description: "Webhook URL to send payment events",
  })
  @IsUrl()
  webhook_url: string;

  @ApiProperty({
    example: ["payment.created", "payment.confirmed"],
    description: "Events to subscribe to",
    required: false,
  })
  @IsOptional()
  @IsArray()
  events_subscribed?: string[];
}

export class PartnerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  webhook_url: string;

  @ApiProperty()
  hmac_secret: string;

  @ApiProperty()
  events_subscribed: string[];

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  created_at: Date;
}

export class PartnerListDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  webhook_url: string;

  @ApiProperty()
  events_subscribed: string[];

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  created_at: Date;
}
