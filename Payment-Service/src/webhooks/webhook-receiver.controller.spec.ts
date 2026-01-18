import { Test, TestingModule } from "@nestjs/testing";
import { WebhookReceiverController } from "./webhook-receiver.controller";
import { WebhookReceiverService } from "./webhook-receiver.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { HmacUtils } from "../utils/hmac.utils";

describe("WebhookReceiverController", () => {
  let controller: WebhookReceiverController;
  let service: WebhookReceiverService;

  const mockPartnerId = "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p";
  const mockPartnerSecret = "test-secret-key-12345";

  const mockPayload = {
    orderId: "123",
    amount: 100.5,
    status: "completed",
  };

  const mockSignature = HmacUtils.generateSignature(
    mockPayload,
    mockPartnerSecret,
  );

  const mockWebhookData = {
    event_type: "order.created",
    payload: mockPayload,
    signature: mockSignature,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookReceiverController],
      providers: [
        {
          provide: WebhookReceiverService,
          useValue: {
            processWebhook: jest.fn(),
            getPartnerSecret: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhookReceiverController>(
      WebhookReceiverController,
    );
    service = module.get<WebhookReceiverService>(WebhookReceiverService);
  });

  describe("receiveWebhook", () => {
    it("should receive and process webhook with valid signature", async () => {
      const mockResult = {
        success: true,
        message: "Webhook received",
        eventId: "evt_123",
        processedAt: new Date(),
      };

      jest
        .spyOn(service, "getPartnerSecret")
        .mockResolvedValue(mockPartnerSecret);
      jest.spyOn(service, "processWebhook").mockResolvedValue(mockResult);

      const result = await controller.receiveWebhook(
        mockWebhookData,
        mockPartnerId,
        mockSignature,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Webhook received");
      expect(service.getPartnerSecret).toHaveBeenCalledWith(mockPartnerId);
      expect(service.processWebhook).toHaveBeenCalled();
    });

    it("should throw error if X-Partner-Id header is missing", async () => {
      await expect(
        controller.receiveWebhook(mockWebhookData, "", mockSignature),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw error if X-Webhook-Signature header is missing", async () => {
      await expect(
        controller.receiveWebhook(mockWebhookData, mockPartnerId, ""),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw error if partner not found", async () => {
      jest.spyOn(service, "getPartnerSecret").mockResolvedValue(null);

      await expect(
        controller.receiveWebhook(
          mockWebhookData,
          "invalid-partner-id",
          mockSignature,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should handle webhook processing errors", async () => {
      jest
        .spyOn(service, "getPartnerSecret")
        .mockResolvedValue(mockPartnerSecret);
      jest
        .spyOn(service, "processWebhook")
        .mockRejectedValue(new Error("Processing failed"));

      await expect(
        controller.receiveWebhook(
          mockWebhookData,
          mockPartnerId,
          mockSignature,
        ),
      ).rejects.toThrow();
    });
  });

  describe("receiveWebhookWithBodySignature", () => {
    it("should process webhook with signature in body", async () => {
      const mockResult = {
        success: true,
        message: "Webhook received",
        eventId: "evt_123",
        processedAt: new Date(),
      };

      const bodyWithPartnerId = {
        ...mockWebhookData,
        partner_id: mockPartnerId,
      };

      jest
        .spyOn(service, "getPartnerSecret")
        .mockResolvedValue(mockPartnerSecret);
      jest.spyOn(service, "processWebhook").mockResolvedValue(mockResult);

      const result =
        await controller.receiveWebhookWithBodySignature(bodyWithPartnerId);

      expect(result.success).toBe(true);
      expect(service.getPartnerSecret).toHaveBeenCalledWith(mockPartnerId);
    });

    it("should throw error if partner_id is missing in body", async () => {
      const bodyWithoutPartnerId = {
        ...mockWebhookData,
      };

      await expect(
        controller.receiveWebhookWithBodySignature(bodyWithoutPartnerId),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw error if signature is missing in body", async () => {
      const bodyWithoutSignature = {
        event_type: "order.created",
        payload: mockPayload,
        partner_id: mockPartnerId,
      };

      await expect(
        controller.receiveWebhookWithBodySignature(bodyWithoutSignature),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
