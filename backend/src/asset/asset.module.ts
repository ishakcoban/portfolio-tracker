import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { PrismaService } from '../prisma.service';
import { PortfolioService } from 'src/portfolio/portfolio.service';

@Module({
  controllers: [AssetController],
  providers: [AssetService,PrismaService,PortfolioService],
})
export class AssetModule {}
