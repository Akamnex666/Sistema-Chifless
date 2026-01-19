import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "../models/payment.entity";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { WebSocketModule } from "../websockets/websocket.module";
import { WebhookModule } from "../webhooks/webhook.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    WebSocketModule,
    WebhookModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
