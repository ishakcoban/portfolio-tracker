import { Module } from '@nestjs/common';
import { PortfolioYearlyChangeService } from './portfolio-yearly-change.service';
import { PortfolioYearlyChangeController } from './portfolio-yearly-change.controller';
import { PrismaService } from 'src/prisma.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [PortfolioYearlyChangeController],
    imports: [HttpModule],
  providers: [PortfolioYearlyChangeService,PrismaService],
})
export class PortfolioYearlyChangeModule {}
