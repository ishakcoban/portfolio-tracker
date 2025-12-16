import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioDailyChangeController } from './portfolio-daily-change.controller';
import { PortfolioDailyChangeService } from './portfolio-daily-change.service';

describe('PortfolioDailyChangeController', () => {
  let controller: PortfolioDailyChangeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioDailyChangeController],
      providers: [PortfolioDailyChangeService],
    }).compile();

    controller = module.get<PortfolioDailyChangeController>(PortfolioDailyChangeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
