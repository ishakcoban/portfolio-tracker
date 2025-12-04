import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PrismaService } from 'src/prisma.service';
import { PortfolioMapper } from './portfolio.mapper';
import { HttpModule } from '@nestjs/axios';
import { TransactionService } from 'src/transaction/transaction.service';
import { AssetMapper } from 'src/asset/asset.mapper';

@Module({
  controllers: [PortfolioController],
  imports: [HttpModule],
  providers: [
    PortfolioService,
    PrismaService,
    PortfolioMapper,
    TransactionService,
    AssetMapper
  ],
})
export class PortfolioModule {}
