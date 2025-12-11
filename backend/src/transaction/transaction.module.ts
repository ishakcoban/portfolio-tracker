import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaService } from 'src/prisma.service';
import { AssetService } from 'src/asset/asset.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionMapper } from './transaction.mapper';

@Module({
  controllers: [TransactionController],
  imports: [HttpModule],
  providers: [TransactionService, PrismaService, AssetService,TransactionMapper],
})
export class TransactionModule {}
