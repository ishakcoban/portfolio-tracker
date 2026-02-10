import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma.service';
import { AssetService } from 'src/asset/asset.service';
import { CreateTransactionRequest } from './request/createTransactionRequest';
import { SellTransactionRequest } from './request/sellTransactionRequest';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { TransactionMapper } from './transaction.mapper';
import { TransactionDto } from './dto/transaction-dto';
import {
  Asset,
  AssetType,
  PortfolioDailyChange,
  PortfolioYearlyChange,
  Transaction,
  TransactionType,
} from 'generated/prisma';
import { Helper } from 'src/utils/helpers';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
type ISODate = `${number}-${number}-${number}`;
@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private assetService: AssetService,
    private readonly httpService: HttpService,
  ) {}

  async create(createTransactionRequest: CreateTransactionRequest) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: { id: createTransactionRequest.assetId },
    });

    const portfolioYearlyChanges =
      await this.prisma.portfolioYearlyChange.findMany({
        where: { portfolioId: asset.portfolioId },
        orderBy: { year: 'asc' },
      });

    switch (createTransactionRequest.type) {
      case 'BUY':
        await this.applyBuyTransaction(
          asset,
          createTransactionRequest,
          portfolioYearlyChanges,
        );
        break;

      case 'SELL':
        await this.applySellTransaction(
          asset,
          createTransactionRequest,
          portfolioYearlyChanges,
        );
        break;
    }
  }

  async createByBulk(createTransactionRequest: CreateTransactionRequest[]) {
    for (const element of createTransactionRequest) {
      await this.create(element);
    }
  }

  async applyBuyTransaction(
    asset: Asset,
    createTransactionRequest: CreateTransactionRequest,
    portfolioYearlyChanges: PortfolioYearlyChange[],
  ) {
    const newTotalInvestedByUSD =
      asset.totalInvestedByUSD + createTransactionRequest.invested;
    const newTotalInvestedByEURO =
      asset.totalInvestedByEURO +
      createTransactionRequest.invested / createTransactionRequest.eurusd;
    const newTotalInvestedByTRY =
      asset.totalInvestedByTRY +
      createTransactionRequest.invested * createTransactionRequest.usdtry;
    const newTotalQuantity =
      asset.totalQuantity +
      createTransactionRequest.invested / createTransactionRequest.price;

    await this.prisma.$transaction([
      this.prisma.asset.update({
        where: { id: createTransactionRequest.assetId },
        data: {
          totalInvestedByUSD: newTotalInvestedByUSD,
          totalInvestedByEURO: newTotalInvestedByEURO,
          totalInvestedByTRY: newTotalInvestedByTRY,
          totalQuantity: newTotalQuantity,
          averageCostByUSD: newTotalInvestedByUSD / newTotalQuantity,
          averageCostByEURO: newTotalInvestedByEURO / newTotalQuantity,
          averageCostByTRY: newTotalInvestedByTRY / newTotalQuantity,
        },
      }),
      this.prisma.portfolio.update({
        where: { id: asset.portfolioId },
        data: {
          totalInvestedByUSD: {
            increment: createTransactionRequest.invested,
          },
          totalInvestedByEURO: {
            increment:
              createTransactionRequest.invested /
              createTransactionRequest.eurusd,
          },
          totalInvestedByTRY: {
            increment:
              createTransactionRequest.invested *
              createTransactionRequest.usdtry,
          },
        },
      }),
      this.prisma.transaction.create({
        data: {
          ...createTransactionRequest,
          quantity:
            createTransactionRequest.invested / createTransactionRequest.price,
          date: new Date(createTransactionRequest.date),
        },
      }),
    ]);

    let transactionYear = new Date(createTransactionRequest.date).getFullYear();

    const currentYear = new Date().getFullYear();

    let yearExists = portfolioYearlyChanges.some(
      (v) => v.year === transactionYear,
    );

    if (yearExists) {
      let yearIndex = portfolioYearlyChanges.findIndex(
        (v) => v.year === transactionYear,
      );

      // adding invested to transaction year
      portfolioYearlyChanges[yearIndex].investedByUSD +=
        createTransactionRequest.invested;
      portfolioYearlyChanges[yearIndex].investedByEURO +=
        createTransactionRequest.invested / createTransactionRequest.eurusd;
      portfolioYearlyChanges[yearIndex].investedByTRY +=
        createTransactionRequest.invested * createTransactionRequest.usdtry;

      while (true) {
        let finalValue = await this.calculateFinalTransactionValueByYear(
          asset,
          createTransactionRequest,
          transactionYear,
        );
        console.log(finalValue);

        if (portfolioYearlyChanges[yearIndex].year == currentYear) {
          await this.updatePortfolioYearlyRoiValues(portfolioYearlyChanges);
          break;
        }

        portfolioYearlyChanges[yearIndex].finalValueByUSD += finalValue.byUSD;
        portfolioYearlyChanges[yearIndex].finalValueByEURO += finalValue.byEURO;
        portfolioYearlyChanges[yearIndex].finalValueByTRY += finalValue.byTRY;

        if (portfolioYearlyChanges[yearIndex + 1].year != transactionYear + 1) {
          const newYearlyChange =
            await this.prisma.portfolioYearlyChange.create({
              data: {
                portfolioId: asset.portfolioId,
                investedByUSD: 0,
                investedByEURO: 0,
                investedByTRY: 0,
                finalValueByUSD: 0,
                finalValueByEURO: 0,
                finalValueByTRY: 0,
                roiByUSD: 0,
                roiByEURO: 0,
                roiByTRY: 0,
                year: transactionYear + 1,
              },
            });

          portfolioYearlyChanges.splice(yearIndex + 1, 0, newYearlyChange);
        }

        yearIndex++;
        transactionYear++;
      }
    } else {
      if (transactionYear == currentYear) {
        return await this.prisma.portfolioYearlyChange.create({
          data: {
            portfolioId: asset.portfolioId,
            investedByUSD: createTransactionRequest.invested,
            investedByEURO:
              createTransactionRequest.invested /
              createTransactionRequest.eurusd,
            investedByTRY:
              createTransactionRequest.invested *
              createTransactionRequest.usdtry,
            finalValueByUSD: -1,
            finalValueByEURO: -1,
            finalValueByTRY: -1,
            roiByUSD: 0,
            roiByEURO: 0,
            roiByTRY: 0,
            year: transactionYear,
          },
        });
      }

      let index = 0;
      let targetYear = transactionYear;
      while (true) {
        if (targetYear > currentYear) {
          await this.updatePortfolioYearlyRoiValues(portfolioYearlyChanges);
          break;
        }
       
        let finalValue = await this.calculateFinalTransactionValueByYear(
          asset,
          createTransactionRequest,
          targetYear,
        );
      
        let targetYearExists = portfolioYearlyChanges.some(
          (v) => v.year === targetYear,
        );
        if (!targetYearExists) {
          const newYearlyChange =
            await this.prisma.portfolioYearlyChange.create({
              data: {
                portfolioId: asset.portfolioId,
                investedByUSD:
                  transactionYear == targetYear
                    ? createTransactionRequest.invested
                    : 0,
                investedByEURO:
                  transactionYear == targetYear
                    ? createTransactionRequest.invested /
                      createTransactionRequest.eurusd
                    : 0,
                investedByTRY:
                  transactionYear == targetYear
                    ? createTransactionRequest.invested *
                      createTransactionRequest.usdtry
                    : 0,
                finalValueByUSD: finalValue.byUSD,
                finalValueByEURO: finalValue.byEURO,
                finalValueByTRY: finalValue.byTRY,
                roiByUSD: 0,
                roiByEURO: 0,
                roiByTRY: 0,
                year: targetYear,
              },
            });

          portfolioYearlyChanges.splice(index, 0, newYearlyChange);
        } else {
          portfolioYearlyChanges[index].finalValueByUSD += finalValue.byUSD;
          portfolioYearlyChanges[index].finalValueByEURO += finalValue.byEURO;
          portfolioYearlyChanges[index].finalValueByTRY += finalValue.byTRY;
        }
        index++;
        targetYear++;
      }
    }
  }

  async applySellTransaction(
    asset: Asset,
    createTransactionRequest: CreateTransactionRequest,
    portfolioYearlyChanges: PortfolioYearlyChange[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const portfolio = await this.prisma.portfolio.findUniqueOrThrow({
        where: { id: asset.portfolioId },
      });
      let quantityToSell = createTransactionRequest.quantity;

      if (quantityToSell > asset.totalQuantity) {
        throw new BadRequestException(
          `Insufficient assets: trying to sell ${quantityToSell} but only ${asset.totalQuantity} available`,
        );
      }

      createTransactionRequest.date = new Date(
        createTransactionRequest.date,
      ).toISOString();

      await tx.transaction.create({
        data: createTransactionRequest,
      });

      const transactions = await tx.transaction.findMany({
        where: {
          assetId: createTransactionRequest.assetId,
        },
        orderBy: {
          date: 'asc',
        },
      });

      const buyTransactions = transactions.filter(
        (t) => t.type === TransactionType.BUY,
      );
      const sellTransactions = transactions.filter(
        (t) => t.type === TransactionType.SELL,
      );

      // FIFO
      let i = 0;

      for (const transaction of sellTransactions) {
        quantityToSell = transaction.quantity;

        while (true) {
          if (quantityToSell <= 0) break;

          const sellingQuantity = Math.min(
            buyTransactions[i].quantity,
            quantityToSell,
          );

          buyTransactions[i].quantity -= sellingQuantity;
          buyTransactions[i].invested -=
            sellingQuantity * buyTransactions[i].price;

          /*******************************************************************/
          let transactionBuyYear = new Date(
            buyTransactions[i].date,
          ).getFullYear();

          const currentYear = new Date().getFullYear();

          let yearIndex = portfolioYearlyChanges.findIndex(
            (v) => v.year === transactionBuyYear,
          );

          // decreasing invested to transaction year
          portfolioYearlyChanges[yearIndex].investedByUSD -=
            sellingQuantity * buyTransactions[i].price;
          portfolioYearlyChanges[yearIndex].investedByEURO -=
            (sellingQuantity * buyTransactions[i].price) /
            buyTransactions[i].eurusd;
          portfolioYearlyChanges[yearIndex].investedByTRY -=
            sellingQuantity *
            buyTransactions[i].price *
            buyTransactions[i].usdtry;

          const transactionCopy = structuredClone(createTransactionRequest);

          transactionCopy.quantity = sellingQuantity;
          transactionCopy.invested = sellingQuantity * buyTransactions[i].price;
          transactionCopy.price = buyTransactions[i].price;
          transactionCopy.eurusd = buyTransactions[i].eurusd;
          transactionCopy.usdtry = buyTransactions[i].usdtry;

          while (true) {
            let finalValue = await this.calculateFinalTransactionValueByYear(
              asset,
              transactionCopy,
              transactionBuyYear,
            );

            if (portfolioYearlyChanges[yearIndex].year == currentYear) {
              await this.updatePortfolioYearlyRoiValues(portfolioYearlyChanges);
              break;
            }

            portfolioYearlyChanges[yearIndex].finalValueByUSD -=
              finalValue.byUSD;
            portfolioYearlyChanges[yearIndex].finalValueByEURO -=
              finalValue.byEURO;
            portfolioYearlyChanges[yearIndex].finalValueByTRY -=
              finalValue.byTRY;

            yearIndex++;
            transactionBuyYear++;
          }
          /*******************************************************************/
          asset.totalQuantity -= sellingQuantity;

          asset.totalInvestedByUSD -=
            sellingQuantity * buyTransactions[i].price;
          asset.averageCostByUSD =
            asset.totalInvestedByUSD / asset.totalQuantity;

          asset.totalInvestedByEURO -=
            (sellingQuantity * buyTransactions[i].price) /
            buyTransactions[i].eurusd;
          asset.averageCostByEURO =
            asset.totalInvestedByEURO / asset.totalQuantity;

          asset.totalInvestedByTRY -=
            sellingQuantity *
            buyTransactions[i].price *
            buyTransactions[i].usdtry;
          asset.averageCostByTRY =
            asset.totalInvestedByTRY / asset.totalQuantity;

          portfolio.totalInvestedByUSD -=
            sellingQuantity * buyTransactions[i].price;
          portfolio.totalInvestedByEURO -=
            (sellingQuantity * buyTransactions[i].price) /
            buyTransactions[i].eurusd;
          portfolio.totalInvestedByTRY -=
            sellingQuantity *
            buyTransactions[i].price *
            buyTransactions[i].usdtry;

          quantityToSell -= sellingQuantity;
          i++;
        }

        await tx.asset.update({ where: { id: asset.id }, data: asset });

        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: portfolio,
        });
      }
    });
  }

  async calculateFinalTransactionValueByYear(
    asset: Asset,
    createTransactionRequest: CreateTransactionRequest,
    targetYear: number,
  ) {
    const lastDate = `${targetYear}-12-31` as ISODate;

    let finalValue = { byUSD: 0, byEURO: 0, byTRY: 0 };

    const url = Helper.findURLForChartByAssetType(
      lastDate,
      asset.type,
      asset.symbol,
    );

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      if (response.status == 200) {
        let timestamps: any[] = [];
        if (asset.type === AssetType.CRYPTO) {
          let candle = response.data[0];
          let assetPriceAtLastDayOfYearByUSD = parseFloat(candle[4]);
          let assetPriceAtLastDayOfYearByEURO =
            parseFloat(candle[4]) *
            (await Helper.getExchangeRatesByDate_secondver(
              this.httpService,
              'EUR',
              lastDate,
            ));

          let assetPriceAtLastDayOfYearByTRY =
            parseFloat(candle[4]) *
            (await Helper.getExchangeRatesByDate_secondver(
              this.httpService,
              'TRY',
              lastDate,
            ));

          let roiByUSD =
            ((assetPriceAtLastDayOfYearByUSD - createTransactionRequest.price) /
              createTransactionRequest.price) *
            100;
          let roiByEURO =
            ((assetPriceAtLastDayOfYearByEURO -
              createTransactionRequest.price *
                createTransactionRequest.eurusd) /
              (createTransactionRequest.price *
                createTransactionRequest.eurusd)) *
            100;
          let roiByTRY =
            ((assetPriceAtLastDayOfYearByTRY -
              createTransactionRequest.price *
                createTransactionRequest.usdtry) /
              (createTransactionRequest.price *
                createTransactionRequest.usdtry)) *
            100;

          let assetEndValueByUSD =
            (createTransactionRequest.invested * (100 + roiByUSD)) / 100;
          let assetEndValueByEURO =
            (createTransactionRequest.invested *
              createTransactionRequest.eurusd *
              (100 + roiByEURO)) /
            100;
          let assetEndValueByTRY =
            (createTransactionRequest.invested *
              createTransactionRequest.usdtry *
              (100 + roiByTRY)) /
            100;

          finalValue.byUSD = assetEndValueByUSD;
          finalValue.byEURO = assetEndValueByEURO;
          finalValue.byTRY = assetEndValueByTRY;
        } else {
          let data = response.data.chart.result[0];
          timestamps = data.timestamp;
let updatedDate = lastDate;
              while (timestamps == undefined) {
                updatedDate = Helper.minusOneDay(updatedDate);

                const url = Helper.findURLForChartByAssetType(
                  updatedDate,
                  asset.type,
                  asset.symbol,
                );
                const response = await firstValueFrom(
                  this.httpService.get(url),
                );

                if (response.status === 200) {
                  data = response.data.chart.result[0];
                  timestamps = data.timestamp;
                }
              }

          let candle = data.indicators.quote[0];
console.log(candle,lastDate)
          let assetPriceAtLastDayOfYearByUSD = candle.close[0];
          let assetPriceAtLastDayOfYearByEURO =
            candle.close[0] *
            (await Helper.getExchangeRatesByDate_secondver(
              this.httpService,
              'EUR',
              lastDate,
            ));
          let assetPriceAtLastDayOfYearByTRY =
            candle.close[0] *
            (await Helper.getExchangeRatesByDate_secondver(
              this.httpService,
              'TRY',
              lastDate,
            ));

          if (asset.type == AssetType.INDEX) {
            assetPriceAtLastDayOfYearByTRY = assetPriceAtLastDayOfYearByUSD;
            assetPriceAtLastDayOfYearByUSD /=
              await Helper.getExchangeRatesByDate_secondver(
                this.httpService,
                'TRY',
                lastDate,
              );

            assetPriceAtLastDayOfYearByEURO =
              assetPriceAtLastDayOfYearByUSD *
              (await Helper.getExchangeRatesByDate_secondver(
                this.httpService,
                'EUR',
                lastDate,
              ));
          }

          let roiByUSD =
            ((assetPriceAtLastDayOfYearByUSD - createTransactionRequest.price) /
              createTransactionRequest.price) *
            100;
          let roiByEURO =
            ((assetPriceAtLastDayOfYearByEURO -
              createTransactionRequest.price *
                createTransactionRequest.eurusd) /
              (createTransactionRequest.price *
                createTransactionRequest.eurusd)) *
            100;
          let roiByTRY =
            ((assetPriceAtLastDayOfYearByTRY -
              createTransactionRequest.price *
                createTransactionRequest.usdtry) /
              (createTransactionRequest.price *
                createTransactionRequest.usdtry)) *
            100;

          let assetEndValueByUSD =
            (createTransactionRequest.invested * (100 + roiByUSD)) / 100;
          let assetEndValueByEURO =
            (createTransactionRequest.invested *
              createTransactionRequest.eurusd *
              (100 + roiByEURO)) /
            100;
          let assetEndValueByTRY =
            (createTransactionRequest.invested *
              createTransactionRequest.usdtry *
              (100 + roiByTRY)) /
            100;

          finalValue.byUSD = assetEndValueByUSD;
          finalValue.byEURO = assetEndValueByEURO;
          finalValue.byTRY = assetEndValueByTRY;
        }
      }
    } catch (error) {}

    return finalValue;
  }

  async updatePortfolioYearlyRoiValues(
    portfolioYearlyChanges: PortfolioYearlyChange[],
  ) {
    for (const [index, element] of portfolioYearlyChanges.entries()) {
      if (index == portfolioYearlyChanges.length - 1) {
        break;
      }

      let previousYearFinalValueByUSD =
        index - 1 < 0 ? 0 : portfolioYearlyChanges[index - 1].finalValueByUSD;
      let previousYearFinalValueByEURO =
        index - 1 < 0 ? 0 : portfolioYearlyChanges[index - 1].finalValueByEURO;
      let previousYearFinalValueByTRY =
        index - 1 < 0 ? 0 : portfolioYearlyChanges[index - 1].finalValueByTRY;

      portfolioYearlyChanges[index].roiByUSD =
        ((element.finalValueByUSD -
          (previousYearFinalValueByUSD + element.investedByUSD)) /
          (previousYearFinalValueByUSD + element.investedByUSD)) *
        100;
      portfolioYearlyChanges[index].roiByEURO =
        ((element.finalValueByEURO -
          (previousYearFinalValueByEURO + element.investedByEURO)) /
          (previousYearFinalValueByEURO + element.investedByEURO)) *
        100;
      portfolioYearlyChanges[index].roiByTRY =
        ((element.finalValueByTRY -
          (previousYearFinalValueByTRY + element.investedByTRY)) /
          (previousYearFinalValueByTRY + element.investedByTRY)) *
        100;
    }

    await Promise.all(
      portfolioYearlyChanges.map((change) =>
        this.prisma.portfolioYearlyChange.update({
          where: {
            id: change.id, // or use a composite unique key
          },
          data: {
            investedByUSD: change.investedByUSD,
            investedByEURO: change.investedByEURO,
            investedByTRY: change.investedByTRY,
            finalValueByUSD: change.finalValueByUSD,
            finalValueByEURO: change.finalValueByEURO,
            finalValueByTRY: change.finalValueByTRY,
            roiByUSD: change.roiByUSD,
            roiByEURO: change.roiByEURO,
            roiByTRY: change.roiByTRY,
          },
        }),
      ),
    );
  }

  toUTCDate(date: ISODate): Date {
    return new Date(`${date}T00:00:00Z`);
  }
  addOneDay(date: ISODate): ISODate {
    const d = this.toUTCDate(date);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().split('T')[0] as ISODate;
  }

  minusOneDay(date: ISODate): ISODate {
    const d = this.toUTCDate(date);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0] as ISODate;
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
        transactions[i].invested -= sellingQuantity * transactions[i].price;

        asset.totalQuantity -= sellingQuantity;

        asset.totalInvestedByUSD -= sellingQuantity * transactions[i].price;
        asset.averageCostByUSD = asset.totalInvestedByUSD / asset.totalQuantity;

        asset.totalInvestedByEURO -=
          (sellingQuantity * transactions[i].price) / transactions[i].eurusd;
        asset.averageCostByEURO =
          asset.totalInvestedByEURO / asset.totalQuantity;

        asset.totalInvestedByTRY -=
          sellingQuantity * transactions[i].price * transactions[i].usdtry;
        asset.averageCostByTRY = asset.totalInvestedByTRY / asset.totalQuantity;

        portfolio.totalInvestedByUSD -= sellingQuantity * transactions[i].price;
        portfolio.totalInvestedByEURO -=
          (sellingQuantity * transactions[i].price) / transactions[i].eurusd;
        portfolio.totalInvestedByTRY -=
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

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
