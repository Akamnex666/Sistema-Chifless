import { Test, TestingModule } from "@nestjs/testing";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Payment } from "../models/payment.entity";

describe("PaymentController", () => {
  let controller: PaymentController;
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should have createPayment method", () => {
    expect(controller.createPayment).toBeDefined();
  });

  it("should have getPayment method", () => {
    expect(controller.getPayment).toBeDefined();
  });

  it("should have confirmPayment method", () => {
    expect(controller.confirmPayment).toBeDefined();
  });
});
