import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PrismaService } from 'src/prisma.service';
import { PortfolioMapper } from './portfolio.mapper';
import { AssetMapper } from 'src/asset/asset.mapper';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioService,PrismaService,PortfolioMapper,AssetMapper],
})
export class PortfolioModule {}
