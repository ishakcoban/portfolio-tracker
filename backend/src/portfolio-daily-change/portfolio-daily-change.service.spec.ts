import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioDailyChangeService } from './portfolio-daily-change.service';

describe('PortfolioDailyChangeService', () => {
  let service: PortfolioDailyChangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioDailyChangeService],
    }).compile();

    service = module.get<PortfolioDailyChangeService>(PortfolioDailyChangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
