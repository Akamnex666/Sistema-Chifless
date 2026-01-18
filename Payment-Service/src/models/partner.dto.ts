/**
 * Partner Registration Request DTO
 */
export class RegisterPartnerDto {
  name: string;
  email: string;
  webhookUrl: string;
}

/**
 * Partner Response DTO
 */
export class PartnerResponseDto {
  id: string;
  name: string;
  email: string;
  webhookUrl: string;
  webhookSecret?: string; // Only returned on creation
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update Partner DTO
 */
export class UpdatePartnerDto {
  name?: string;
  email?: string;
  webhookUrl?: string;
  isActive?: boolean;
}
