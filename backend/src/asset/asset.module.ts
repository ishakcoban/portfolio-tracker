import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { PrismaService } from '../prisma.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionMapper } from 'src/transaction/transaction.mapper';

@Module({
  controllers: [AssetController],
  imports: [HttpModule],
  providers: [AssetService, PrismaService,TransactionService,TransactionMapper],
})
export class AssetModule {}
