import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PaymentsModule } from "./payments/payment.module";
import { Payment } from "./models/payment.entity";
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
      entities: [Payment],
    }),
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
