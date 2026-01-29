import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioYearlyChangeController } from './portfolio-yearly-change.controller';
import { PortfolioYearlyChangeService } from './portfolio-yearly-change.service';

describe('PortfolioYearlyChangeController', () => {
  let controller: PortfolioYearlyChangeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioYearlyChangeController],
      providers: [PortfolioYearlyChangeService],
    }).compile();

    controller = module.get<PortfolioYearlyChangeController>(PortfolioYearlyChangeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
