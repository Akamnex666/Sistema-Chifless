import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { PartnerService } from "./partner.service";
import {
  RegisterPartnerDto,
  PartnerResponseDto,
  PartnerListDto,
} from "./partner.dto";

@ApiTags("Partners")
@Controller("partners")
export class PartnerController {
  constructor(private partnerService: PartnerService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new partner",
    description:
      "Registers a new partner and generates an HMAC secret for webhook verification",
  })
  @ApiResponse({
    status: 201,
    description: "Partner registered successfully",
    type: PartnerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input or duplicate webhook URL",
  })
  async registerPartner(
    @Body() registerPartnerDto: RegisterPartnerDto,
  ): Promise<PartnerResponseDto> {
    if (!registerPartnerDto.name || !registerPartnerDto.webhook_url) {
      throw new BadRequestException("name and webhook_url are required fields");
    }

    try {
      return await this.partnerService.registerPartner(registerPartnerDto);
    } catch (error) {
      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        throw new BadRequestException(
          "A partner with this webhook URL already exists",
        );
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: "Get all active partners",
    description: "Retrieves a list of all active partners",
  })
  @ApiResponse({
    status: 200,
    description: "List of active partners",
    type: [PartnerListDto],
  })
  async getAllPartners(): Promise<PartnerListDto[]> {
    const partners = await this.partnerService.getAllPartners();
    return partners.map((p) => ({
      id: p.id,
      name: p.name,
      webhook_url: p.webhook_url,
      events_subscribed: p.events_subscribed || [],
      active: p.active,
      created_at: p.created_at,
    }));
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get partner by ID",
    description: "Retrieves a specific partner by ID",
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "Partner ID (UUID)",
  })
  @ApiResponse({
    status: 200,
    description: "Partner found",
    type: PartnerListDto,
  })
  @ApiResponse({
    status: 404,
    description: "Partner not found",
  })
  async getPartnerById(@Param("id") id: string): Promise<PartnerListDto> {
    const partner = await this.partnerService.getPartnerById(id);

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return {
      id: partner.id,
      name: partner.name,
      webhook_url: partner.webhook_url,
      events_subscribed: partner.events_subscribed || [],
      active: partner.active,
      created_at: partner.created_at,
    };
  }
}
