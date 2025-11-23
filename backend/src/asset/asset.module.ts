import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { PrismaService } from '../prisma.service';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { AssetMapper } from './asset.mapper';
import { PortfolioMapper } from 'src/portfolio/portfolio.mapper';
import { HttpModule, HttpService } from '@nestjs/axios';
import { CurrentMarketPriceResponse } from './response/current-market-price-response';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  controllers: [AssetController],
  imports: [HttpModule],
  providers: [
    AssetService,
    PrismaService,
    PortfolioService,
    TransactionService,
    AssetMapper,
    PortfolioMapper,
    CurrentMarketPriceResponse,
  ],
})
export class AssetModule {}
