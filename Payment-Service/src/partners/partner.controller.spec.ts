import { Test, TestingModule } from "@nestjs/testing";
import { PartnerController } from "./partner.controller";
import { PartnerService } from "./partner.service";
import { RegisterPartnerDto } from "./partner.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("PartnerController", () => {
  let controller: PartnerController;
  let service: PartnerService;

  const mockPartner = {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    name: "n8n",
    webhook_url: "https://n8n.example.com/webhook",
    events_subscribed: ["payment.confirmed"],
    hmac_secret: "secret123xyz",
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerController],
      providers: [
        {
          provide: PartnerService,
          useValue: {
            registerPartner: jest.fn(),
            getAllPartners: jest.fn(),
            getPartnerById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PartnerController>(PartnerController);
    service = module.get<PartnerService>(PartnerService);
  });

  describe("registerPartner", () => {
    it("should register a new partner", async () => {
      const registerDto: RegisterPartnerDto = {
        name: "n8n",
        webhook_url: "https://n8n.example.com/webhook",
        events_subscribed: ["payment.confirmed"],
      };

      jest.spyOn(service, "registerPartner").mockResolvedValue(mockPartner);

      const result = await controller.registerPartner(registerDto);

      expect(result).toEqual(mockPartner);
      expect(service.registerPartner).toHaveBeenCalledWith(registerDto);
    });

    it("should throw BadRequestException if name is missing", async () => {
      const invalidDto = {
        webhook_url: "https://n8n.example.com/webhook",
      } as RegisterPartnerDto;

      await expect(controller.registerPartner(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if webhook_url is missing", async () => {
      const invalidDto = {
        name: "n8n",
      } as RegisterPartnerDto;

      await expect(controller.registerPartner(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getAllPartners", () => {
    it("should return a list of partners", async () => {
      jest.spyOn(service, "getAllPartners").mockResolvedValue([mockPartner]);

      const result = await controller.getAllPartners();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("n8n");
      expect(service.getAllPartners).toHaveBeenCalled();
    });

    it("should return empty array when no partners exist", async () => {
      jest.spyOn(service, "getAllPartners").mockResolvedValue([]);

      const result = await controller.getAllPartners();

      expect(result).toEqual([]);
    });
  });

  describe("getPartnerById", () => {
    it("should return a partner by ID", async () => {
      jest.spyOn(service, "getPartnerById").mockResolvedValue(mockPartner);

      const result = await controller.getPartnerById(mockPartner.id);

      expect(result).toEqual(expect.objectContaining({ id: mockPartner.id }));
      expect(service.getPartnerById).toHaveBeenCalledWith(mockPartner.id);
    });

    it("should throw NotFoundException if partner does not exist", async () => {
      jest.spyOn(service, "getPartnerById").mockResolvedValue(null);

      await expect(controller.getPartnerById("nonexistent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
