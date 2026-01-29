import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioYearlyChangeService } from './portfolio-yearly-change.service';

describe('PortfolioYearlyChangeService', () => {
  let service: PortfolioYearlyChangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioYearlyChangeService],
    }).compile();

    service = module.get<PortfolioYearlyChangeService>(PortfolioYearlyChangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
