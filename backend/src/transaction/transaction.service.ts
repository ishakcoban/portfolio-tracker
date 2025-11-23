import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { AssetService } from 'src/asset/asset.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: { id: createTransactionDto.assetId },
    });

 
    if (createTransactionDto.type === 'BUY') {
      const newTotalRawInvestmentByUSD =
        asset.totalRawInvestmentByUSD + createTransactionDto.investment;
      const newTotalRawInvestmentByEURO =
        asset.totalRawInvestmentByEURO +
        createTransactionDto.investment / createTransactionDto.eurusd;
      const newTotalRawInvestmentByTRY =
        asset.totalRawInvestmentByTRY +
        createTransactionDto.investment * createTransactionDto.usdtry;
      const newTotalQuantity =
        asset.totalQuantity +
        createTransactionDto.investment / createTransactionDto.price;

      await this.prisma.$transaction([
        this.prisma.asset.update({
          where: { id: createTransactionDto.assetId },
          data: {
            totalRawInvestmentByUSD: newTotalRawInvestmentByUSD,
            totalRawInvestmentByEURO: newTotalRawInvestmentByEURO,
            totalRawInvestmentByTRY: newTotalRawInvestmentByTRY,
            totalQuantity: newTotalQuantity,
            averageCostByUSD: newTotalRawInvestmentByUSD / newTotalQuantity,
            averageCostByEURO: newTotalRawInvestmentByEURO / newTotalQuantity,
            averageCostByTRY: newTotalRawInvestmentByTRY / newTotalQuantity,
          },
        }),
        this.prisma.portfolio.update({
          where: { id: asset.portfolioId },
          data: {
            totalRawInvestmentByUSD: {
              increment: createTransactionDto.investment,
            },
            totalRawInvestmentByEURO: {
              increment:
                createTransactionDto.investment / createTransactionDto.eurusd,
            },
            totalRawInvestmentByTRY: {
              increment:
                createTransactionDto.investment * createTransactionDto.usdtry,
            },
          },
        }),
        this.prisma.transaction.create({
          data: {
            ...createTransactionDto,
            date: new Date(createTransactionDto.date),
          },
        }),
      ]);
    }
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
