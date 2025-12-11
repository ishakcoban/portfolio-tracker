import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma.service';
import { AssetService } from 'src/asset/asset.service';
import { CreateTransactionRequest } from './request/createTransactionRequest';
import { SellTransactionRequest } from './request/sellTransactionRequest';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { TransactionMapper } from './transaction.mapper';
import { TransactionDto } from './dto/transaction-dto';
import { Transaction } from 'generated/prisma';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private assetService: AssetService,
    private transactionMapper: TransactionMapper,
  ) {}

  async create(createTransactionRequest: CreateTransactionRequest) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: { id: createTransactionRequest.assetId },
    });

    if (createTransactionRequest.type === 'BUY') {
      const newTotalRawInvestmentByUSD =
        asset.totalRawInvestmentByUSD + createTransactionRequest.investment;
      const newTotalRawInvestmentByEURO =
        asset.totalRawInvestmentByEURO +
        createTransactionRequest.investment / createTransactionRequest.eurusd;
      const newTotalRawInvestmentByTRY =
        asset.totalRawInvestmentByTRY +
        createTransactionRequest.investment * createTransactionRequest.usdtry;
      const newTotalQuantity =
        asset.totalQuantity +
        createTransactionRequest.investment / createTransactionRequest.price;

      await this.prisma.$transaction([
        this.prisma.asset.update({
          where: { id: createTransactionRequest.assetId },
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
              increment: createTransactionRequest.investment,
            },
            totalRawInvestmentByEURO: {
              increment:
                createTransactionRequest.investment /
                createTransactionRequest.eurusd,
            },
            totalRawInvestmentByTRY: {
              increment:
                createTransactionRequest.investment *
                createTransactionRequest.usdtry,
            },
          },
        }),
        this.prisma.transaction.create({
          data: {
            ...createTransactionRequest,
            quantity:
              createTransactionRequest.investment /
              createTransactionRequest.price,
            date: new Date(createTransactionRequest.date),
          },
        }),
      ]);
    }
  }

  async sellTransactionByFIFO(sellTransactionRequest: SellTransactionRequest) {
    return this.prisma.$transaction(async (tx) => {
      const asset = await this.assetService.findOne(
        sellTransactionRequest.assetId,
      );

      const portfolio = await this.prisma.portfolio.findUniqueOrThrow({
        where: { id: asset.portfolioId },
      });
      let quantityToSell = sellTransactionRequest.quantity;

      if (quantityToSell > asset.totalQuantity) {
        throw new BadRequestException(
          `Insufficient assets: trying to sell ${quantityToSell} but only ${asset.totalQuantity} available`,
        );
      }

      const transactions = await this.findAllByAssetId(asset.id);

      // FIFO
      let i = 0;
      while (true) {
        if (quantityToSell <= 0) break;

        const sellingQuantity = Math.min(
          transactions[i].quantity,
          quantityToSell,
        );

        transactions[i].quantity -= sellingQuantity;
        transactions[i].investment -= sellingQuantity * transactions[i].price;

        asset.totalQuantity -= sellingQuantity;

        asset.totalRawInvestmentByUSD -=
          sellingQuantity * transactions[i].price;
        asset.averageCostByUSD =
          asset.totalRawInvestmentByUSD / asset.totalQuantity;

        asset.totalRawInvestmentByEURO -=
          sellingQuantity * transactions[i].price / transactions[i].eurusd;
        asset.averageCostByEURO =
          asset.totalRawInvestmentByEURO / asset.totalQuantity;

        asset.totalRawInvestmentByTRY -=
          sellingQuantity * transactions[i].price * transactions[i].usdtry;
        asset.averageCostByTRY =
          asset.totalRawInvestmentByTRY / asset.totalQuantity;

        portfolio.totalRawInvestmentByUSD -=
          sellingQuantity * transactions[i].price;
        portfolio.totalRawInvestmentByEURO -=
          sellingQuantity * transactions[i].price / transactions[i].eurusd;
        portfolio.totalRawInvestmentByTRY -=
          sellingQuantity * transactions[i].price * transactions[i].usdtry;

        await tx.transaction.update({
          where: { id: transactions[i].id },
          data: transactions[i],
        });
        quantityToSell -= sellingQuantity;
        i++;
      }

      await tx.asset.update({ where: { id: asset.id }, data: asset });

      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: portfolio,
      });
    });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: id },
    });

    return transaction;
  }
  async findAllByAssetId(id: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: { assetId: id },
      orderBy: {
        date: 'asc',
      },
    });

    return transactions;
  }
  async update(id: number, transaction: Transaction) {
    await this.prisma.transaction.update({
      where: { id: id },
      data: transaction,
    });
  }

  updateWholePortfolio() {}

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
