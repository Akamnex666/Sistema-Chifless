import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return hello message', () => {
    const result = controller.getHello();
    expect(result).toBe('Payment Service API - v1.0');
  });

  it('should return status', () => {
    const result = controller.getStatus();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('service');
    expect(result).toHaveProperty('timestamp');
  });
});
  });
});
