/**
 * Partner Interface
 * Represents a payment partner for B2B webhook integrations
 */
export interface IPartner {
  id: string;
  name: string;
  email: string;
  webhookUrl: string;
  webhookSecret: string;
  isActive: boolean;
  retryAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Partner Registration Request DTO
 */
export class PartnerRegistrationDto {
  name: string;
  email: string;
  webhookUrl: string;
  webhookSecret: string;
}
