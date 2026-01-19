import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Partner } from "./partner.entity";
import { RegisterPartnerDto, PartnerResponseDto } from "./partner.dto";
import * as crypto from "crypto";

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  async registerPartner(
    registerPartnerDto: RegisterPartnerDto,
  ): Promise<PartnerResponseDto> {
    const { name, webhook_url, events_subscribed = [] } = registerPartnerDto;

    // Generate HMAC secret (32 bytes = 64 hex characters)
    const hmac_secret = crypto.randomBytes(32).toString("hex");

    const partner = this.partnerRepository.create({
      name,
      webhook_url,
      events_subscribed,
      hmac_secret,
      active: true,
    });

    const savedPartner = await this.partnerRepository.save(partner);

    return {
      id: savedPartner.id,
      name: savedPartner.name,
      webhook_url: savedPartner.webhook_url,
      hmac_secret: savedPartner.hmac_secret,
      events_subscribed: savedPartner.events_subscribed || [],
      active: savedPartner.active,
      created_at: savedPartner.created_at,
    };
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    return this.partnerRepository.findOne({ where: { id } });
  }

  async getAllPartners(): Promise<Partner[]> {
    return this.partnerRepository.find({ where: { active: true } });
  }

  async updatePartner(
    id: string,
    updates: Partial<Partner>,
  ): Promise<Partner | null> {
    await this.partnerRepository.update(id, updates);
    return this.partnerRepository.findOne({ where: { id } });
  }

  async deactivatePartner(id: string): Promise<void> {
    await this.partnerRepository.update(id, { active: false });
  }

  async getPartnersByEvent(eventName: string): Promise<Partner[]> {
    const partners = await this.partnerRepository.find({
      where: { active: true },
    });
    return partners.filter(
      (p) => p.events_subscribed && p.events_subscribed.includes(eventName),
    );
  }
}
