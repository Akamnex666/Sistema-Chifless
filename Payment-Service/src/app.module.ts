import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PaymentsModule } from "./payments/payment.module";
import { PartnerModule } from "./partners/partner.module";
import { WebhookModule } from "./webhooks/webhook.module";
import { Payment } from "./models/payment.entity";
import { Partner } from "./partners/partner.entity";
import { WebhookDispatch } from "./models/webhook-dispatch.entity";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "postgres",
      port: parseInt(process.env.DATABASE_PORT || "5432"),
      username: process.env.DATABASE_USER || "admin",
      password: process.env.DATABASE_PASSWORD || "admin123",
      database: process.env.DATABASE_NAME || "sistema-chifles",
      synchronize: true,
      logging: false,
      entities: [Payment, Partner, WebhookDispatch],
    }),
    PaymentsModule,
    PartnerModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
