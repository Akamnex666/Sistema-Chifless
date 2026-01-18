import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("Health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Health check" })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("status")
  @ApiOperation({ summary: "Service status" })
  getStatus(): object {
    return this.appService.getStatus();
  }
}
