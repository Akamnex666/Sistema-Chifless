import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Payment Service API - v1.0";
  }

  getStatus(): object {
    return {
      status: "online",
      service: "Payment Service",
      timestamp: new Date().toISOString(),
    };
  }
}
