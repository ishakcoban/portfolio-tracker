import { Module } from '@nestjs/common';
import { PortfolioDailyChangeService } from './portfolio-daily-change.service';
import { PortfolioDailyChangeController } from './portfolio-daily-change.controller';
import { PrismaService } from 'src/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [PortfolioDailyChangeController],
  imports: [HttpModule],
  providers: [PortfolioDailyChangeService, PrismaService],
})
export class PortfolioDailyChangeModule {}
