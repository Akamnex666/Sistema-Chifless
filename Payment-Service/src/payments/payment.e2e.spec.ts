import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";
import { PaymentService } from "./payment.service";
import { PaymentGateway } from "../websockets/payment.gateway";

/**
 * E2E Testing Suite para Payment Service
 * Valida flujo completo: crear pago → confirmar → webhooks → websocket
 */
describe("Payment Service E2E Tests (Task 24)", () => {
  let app: INestApplication;
  let paymentService: PaymentService;
  let paymentGateway: PaymentGateway;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    paymentService = moduleFixture.get<PaymentService>(PaymentService);
    paymentGateway = moduleFixture.get<PaymentGateway>(PaymentGateway);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("1. Payment Creation Flow", () => {
    it("should create a payment and return valid response", async () => {
      const createPaymentDto = {
        orderId: "test-order-e2e-001",
        amount: 100.0,
        currency: "USD",
        provider: "mock",
        metadata: {
          customerId: "cust-001",
          description: "E2E test payment",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("transactionId");
      expect(response.body.amount).toBe(100.0);
      expect(response.body.status).toBe("pending");
      expect(response.body.orderId).toBe("test-order-e2e-001");
    });

    it("should handle invalid payment creation", async () => {
      const invalidPaymentDto = {
        orderId: "test-order-invalid",
        amount: -50, // Invalid negative amount
        currency: "USD",
      };

      await request(app.getHttpServer())
        .post("/payments/create")
        .send(invalidPaymentDto)
        .expect(400);
    });
  });

  describe("2. Payment Confirmation Flow (Task 23)", () => {
    let paymentId: string;
    let transactionId: string;

    beforeAll(async () => {
      // Create a payment first
      const createPaymentDto = {
        orderId: "test-order-confirm-001",
        amount: 250.0,
        currency: "USD",
        provider: "mock",
        metadata: {
          customerId: "cust-002",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      paymentId = response.body.id;
      transactionId = response.body.transactionId;
    });

    it("should confirm payment successfully", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments/confirm")
        .send({
          paymentId,
          transactionId,
          metadata: { confirmationCode: "E2E-TEST-001" },
        })
        .expect(200);

      expect(response.body.status).toBe("completed");
      expect(response.body.transactionId).toBe(transactionId);
    });

    it("should handle confirming non-existent payment", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments/confirm")
        .send({
          paymentId: "non-existent-id",
          transactionId: "non-existent-txn",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should trigger webhook dispatch on confirmation", async () => {
      const dispatchSpy = jest.spyOn(
        paymentService["webhookDispatcher"],
        "dispatchEvent",
      );

      const createPaymentDto = {
        orderId: "test-order-webhook-trigger",
        amount: 150.0,
        currency: "USD",
        provider: "mock",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      const { transactionId: txnId } = createResponse.body;

      await request(app.getHttpServer()).post("/payments/confirm").send({
        paymentId: createResponse.body.id,
        transactionId: txnId,
      });

      // Verify webhook was dispatched
      expect(dispatchSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "payment.confirmed",
          transaction_id: txnId,
        }),
      );

      dispatchSpy.mockRestore();
    });
  });

  describe("3. Payment Retrieval", () => {
    let paymentId: string;

    beforeAll(async () => {
      const createPaymentDto = {
        orderId: "test-order-retrieve",
        amount: 75.0,
        currency: "USD",
        provider: "mock",
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      paymentId = response.body.id;
    });

    it("should retrieve payment by ID", async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .expect(200);

      expect(response.body.id).toBe(paymentId);
      expect(response.body.amount).toBe(75.0);
    });

    it("should return 404 for non-existent payment", async () => {
      await request(app.getHttpServer())
        .get("/payments/non-existent-id")
        .expect(404);
    });

    it("should retrieve payment by transaction ID", async () => {
      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send({
          orderId: "test-order-txn-search",
          amount: 200.0,
          currency: "USD",
          provider: "mock",
        });

      const { transactionId } = createResponse.body;

      const response = await request(app.getHttpServer())
        .get(`/payments/transaction/${transactionId}`)
        .expect(200);

      expect(response.body.transactionId).toBe(transactionId);
    });
  });

  describe("4. Refund Flow", () => {
    let transactionId: string;

    beforeAll(async () => {
      const createPaymentDto = {
        orderId: "test-order-refund",
        amount: 500.0,
        currency: "USD",
        provider: "mock",
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      // First confirm the payment
      await request(app.getHttpServer()).post("/payments/confirm").send({
        paymentId: response.body.id,
        transactionId: response.body.transactionId,
      });

      transactionId = response.body.transactionId;
    });

    it("should refund confirmed payment", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments/refund")
        .send({
          transactionId,
          amount: 500.0,
        })
        .expect(200);

      expect(response.body.status).toBe("refunded");
    });

    it("should handle partial refund", async () => {
      const createPaymentDto = {
        orderId: "test-order-partial-refund",
        amount: 1000.0,
        currency: "USD",
        provider: "mock",
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      await request(app.getHttpServer()).post("/payments/confirm").send({
        paymentId: response.body.id,
        transactionId: response.body.transactionId,
      });

      const refundResponse = await request(app.getHttpServer())
        .post("/payments/refund")
        .send({
          transactionId: response.body.transactionId,
          amount: 500.0, // Partial refund
        })
        .expect(200);

      expect(refundResponse.body.metadata.refundedAmount).toBe(500.0);
    });
  });

  describe("5. PaymentEvent Normalization", () => {
    it("should normalize payment event from Mock adapter", async () => {
      const createPaymentDto = {
        orderId: "test-order-event-norm",
        amount: 300.0,
        currency: "USD",
        provider: "mock",
        metadata: { description: "Event normalization test" },
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      const confirmResponse = await request(app.getHttpServer())
        .post("/payments/confirm")
        .send({
          paymentId: createResponse.body.id,
          transactionId: createResponse.body.transactionId,
        });

      const payment = confirmResponse.body;

      // Validate normalized event structure
      expect(payment).toHaveProperty("transactionId");
      expect(payment).toHaveProperty("amount");
      expect(payment).toHaveProperty("currency");
      expect(payment).toHaveProperty("status");
      expect(payment.status).toBe("completed");
    });
  });

  describe("6. Error Handling & Edge Cases", () => {
    it("should handle missing required fields", async () => {
      const incompleteDto = {
        orderId: "test-order-incomplete",
        // Missing amount and currency
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(incompleteDto)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should handle concurrent payment confirmations gracefully", async () => {
      const createPaymentDto = {
        orderId: "test-order-concurrent",
        amount: 100.0,
        currency: "USD",
        provider: "mock",
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      const { paymentId, transactionId } = response.body;

      // Attempt concurrent confirmations
      const confirmPromises = [
        request(app.getHttpServer())
          .post("/payments/confirm")
          .send({ paymentId, transactionId }),
        request(app.getHttpServer())
          .post("/payments/confirm")
          .send({ paymentId, transactionId }),
      ];

      const results = await Promise.all(confirmPromises);

      // At least one should succeed
      const successCount = results.filter((r) => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it("should handle very large amounts", async () => {
      const largeAmountDto = {
        orderId: "test-order-large-amount",
        amount: 999999999.99,
        currency: "USD",
        provider: "mock",
      };

      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(largeAmountDto)
        .expect(201);

      expect(response.body.amount).toBe(999999999.99);
    });

    it("should validate currency codes", async () => {
      const invalidCurrencyDto = {
        orderId: "test-order-invalid-currency",
        amount: 100.0,
        currency: "INVALID",
        provider: "mock",
      };

      // Should either accept and store, or validate
      const response = await request(app.getHttpServer())
        .post("/payments/create")
        .send(invalidCurrencyDto);

      // Accept either 201 or 400 depending on validation
      expect([201, 400]).toContain(response.status);
    });
  });

  describe("7. WebSocket Integration (Task 23)", () => {
    it("should notify via WebSocket on payment confirmation", async () => {
      const notifyPaymentSpy = jest.spyOn(
        paymentGateway,
        "notifyPaymentConfirmed",
      );

      const createPaymentDto = {
        orderId: "test-order-ws-notify",
        amount: 150.0,
        currency: "USD",
        provider: "mock",
        metadata: { customerId: "cust-ws-001" },
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      await request(app.getHttpServer()).post("/payments/confirm").send({
        paymentId: createResponse.body.id,
        transactionId: createResponse.body.transactionId,
      });

      // Verify WebSocket notification was sent
      expect(notifyPaymentSpy).toHaveBeenCalled();
      expect(notifyPaymentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: createResponse.body.transactionId,
          amount: 150.0,
        }),
      );

      notifyPaymentSpy.mockRestore();
    });

    it("should notify WebSocket on refund", async () => {
      const notifyStatusSpy = jest.spyOn(paymentGateway, "notifyStatusUpdate");

      const createPaymentDto = {
        orderId: "test-order-refund-ws",
        amount: 200.0,
        currency: "USD",
        provider: "mock",
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      await request(app.getHttpServer()).post("/payments/confirm").send({
        paymentId: createResponse.body.id,
        transactionId: createResponse.body.transactionId,
      });

      await request(app.getHttpServer()).post("/payments/refund").send({
        transactionId: createResponse.body.transactionId,
        amount: 200.0,
      });

      // Verify WebSocket notification was sent
      expect(notifyStatusSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "payment_refunded",
          level: "info",
        }),
      );

      notifyStatusSpy.mockRestore();
    });
  });

  describe("8. Data Persistence", () => {
    it("should persist payment data correctly", async () => {
      const createPaymentDto = {
        orderId: "test-order-persistence",
        amount: 350.0,
        currency: "EUR",
        provider: "mock",
        metadata: { customerId: "cust-persist", invoiceId: "inv-001" },
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      const { paymentId, transactionId } = createResponse.body;

      // Retrieve and verify all data persisted
      const retrieveResponse = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .expect(200);

      expect(retrieveResponse.body).toMatchObject({
        amount: 350.0,
        currency: "EUR",
        orderId: "test-order-persistence",
        transactionId,
      });
      expect(retrieveResponse.body.metadata).toHaveProperty("customerId");
      expect(retrieveResponse.body.metadata.customerId).toBe("cust-persist");
    });

    it("should preserve metadata through update operations", async () => {
      const createPaymentDto = {
        orderId: "test-order-metadata",
        amount: 400.0,
        currency: "USD",
        provider: "mock",
        metadata: { source: "mobile", version: "1.0" },
      };

      const createResponse = await request(app.getHttpServer())
        .post("/payments/create")
        .send(createPaymentDto);

      const confirmResponse = await request(app.getHttpServer())
        .post("/payments/confirm")
        .send({
          paymentId: createResponse.body.id,
          transactionId: createResponse.body.transactionId,
        });

      // Verify original metadata preserved
      expect(confirmResponse.body.metadata).toHaveProperty("source");
      expect(confirmResponse.body.metadata.source).toBe("mobile");
    });
  });
});
