import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WebhookDispatch } from "../models/webhook-dispatch.entity";
import { Partner } from "../partners/partner.entity";
import { WebhookDispatcherService } from "./webhook-dispatcher.service";
import { WebhookReceiverService } from "./webhook-receiver.service";
import { WebhookReceiverController } from "./webhook-receiver.controller";

@Module({
  imports: [TypeOrmModule.forFeature([WebhookDispatch, Partner])],
  providers: [WebhookDispatcherService, WebhookReceiverService],
  controllers: [WebhookReceiverController],
  exports: [WebhookDispatcherService, WebhookReceiverService],
})
export class WebhookModule {}
