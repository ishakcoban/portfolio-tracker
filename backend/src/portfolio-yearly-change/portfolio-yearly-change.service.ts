import { Injectable } from '@nestjs/common';
import { CreatePortfolioYearlyChangeDto } from './dto/create-portfolio-yearly-change.dto';
import { UpdatePortfolioYearlyChangeDto } from './dto/update-portfolio-yearly-change.dto';
import { Helper } from 'src/utils/helpers';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma.service';
import { AssetType } from 'generated/prisma';
type ISODate = `${number}-${number}-${number}`; // yyyy-mm-dd
@Injectable()
export class PortfolioYearlyChangeService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  create(createPortfolioYearlyChangeDto: CreatePortfolioYearlyChangeDto) {
    return 'This action adds a new portfolioYearlyChange';
  }

  async getYearlyChanges(pID: number) {
    return await this.prisma.portfolioYearlyChange.findMany({
      where: { portfolioId: pID },
      orderBy: { year: 'asc' },
    });
  }

  async calculateInvestedByYear(pID: number, year: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        asset: {
          portfolioId: pID,
        },
        date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      select: {
        type: true,
        quantity: true,
        price: true,
        date: true,
        eurusd: true,
        usdtry: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // FIFO calculation with currency tracking
    interface PurchaseLot {
      quantity: number;
      priceUSD: number;
      eurusd: number;
      usdtry: number;
    }

    const purchaseQueue: PurchaseLot[] = [];
    let totalInvestmentUSD = 0;
    let totalInvestmentEUR = 0;
    let totalInvestmentTRY = 0;

    for (const transaction of transactions) {
      const priceUSD = transaction.price; // Already in USD
      const priceEUR = priceUSD / transaction.eurusd; // USD to EUR
      const priceTRY = priceUSD * transaction.usdtry; // USD to TRY

      if (transaction.type === 'BUY') {
        // Add to purchase queue
        purchaseQueue.push({
          quantity: transaction.quantity,
          priceUSD: priceUSD,
          eurusd: transaction.eurusd,
          usdtry: transaction.usdtry,
        });

        // Add to totals in all currencies
        totalInvestmentUSD += transaction.quantity * priceUSD;
        totalInvestmentEUR += transaction.quantity * priceEUR;
        totalInvestmentTRY += transaction.quantity * priceTRY;
      } else if (transaction.type === 'SELL') {
        let remainingToSell = transaction.quantity;

        // Process FIFO: sell from oldest purchases first
        while (remainingToSell > 0 && purchaseQueue.length > 0) {
          const oldestLot = purchaseQueue[0];
          const buyPriceUSD = oldestLot.priceUSD;
          const buyPriceEUR = buyPriceUSD / oldestLot.eurusd;
          const buyPriceTRY = buyPriceUSD * oldestLot.usdtry;

          if (oldestLot.quantity <= remainingToSell) {
            // Sell entire lot - remove the cost basis
            totalInvestmentUSD -= oldestLot.quantity * buyPriceUSD;
            totalInvestmentEUR -= oldestLot.quantity * buyPriceEUR;
            totalInvestmentTRY -= oldestLot.quantity * buyPriceTRY;

            remainingToSell -= oldestLot.quantity;
            purchaseQueue.shift();
          } else {
            // Partially sell the lot
            totalInvestmentUSD -= remainingToSell * buyPriceUSD;
            totalInvestmentEUR -= remainingToSell * buyPriceEUR;
            totalInvestmentTRY -= remainingToSell * buyPriceTRY;

            oldestLot.quantity -= remainingToSell;
            remainingToSell = 0;
          }
        }
      }
    }

    return {
      byUSD: totalInvestmentUSD,
      byEURO: totalInvestmentEUR,
      byTRY: totalInvestmentTRY,
    };
  }

  async calculateEndValueByYear(pID: number, year: string) {
    const assets = await this.prisma.asset.findMany({
      where: { portfolioId: pID },
    });

    let date = this.addOneDay(year as ISODate);
    let currentInvestment = { byUSD: 0, byEURO: 0, byTRY: 0 };

    const result = assets.map(async (asset, index) => {
      const url = Helper.findURLForChartByAssetType(
        date,
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
              (await Helper.getExchangeRatesByDate(
                this.httpService,
                'EUR',
                this.minusOneDay(date),
              ));
            let assetPriceAtLastDayOfYearByTRY =
              parseFloat(candle[4]) *
              (await Helper.getExchangeRatesByDate(
                this.httpService,
                'TRY',
                this.minusOneDay(date),
              ));

            let roiByUSD =
              (assetPriceAtLastDayOfYearByUSD * 100) / asset.averageCostByUSD -
              100;
            let roiByEURO =
              (assetPriceAtLastDayOfYearByEURO * 100) /
                asset.averageCostByEURO -
              100;
            let roiByTRY =
              (assetPriceAtLastDayOfYearByTRY * 100) / asset.averageCostByTRY -
              100;
            let assetEndValueByUSD =
              (asset.totalInvestedByUSD * (100 + roiByUSD)) / 100;
            let assetEndValueByEURO =
              (asset.totalInvestedByEURO * (100 + roiByEURO)) / 100;
            let assetEndValueByTRY =
              (asset.totalInvestedByTRY * (100 + roiByTRY)) / 100;

            currentInvestment.byUSD += assetEndValueByUSD;
            currentInvestment.byEURO += assetEndValueByEURO;
            currentInvestment.byTRY += assetEndValueByTRY;
          } else {
            let data = response.data.chart.result[0];

            timestamps = data.timestamp;

            if (timestamps == undefined) {
              data = data.meta.chartPreviousClose;
            }

            let candle = data.indicators.quote[0];

            let assetPriceAtLastDayOfYearByUSD = candle.close[0];
            let assetPriceAtLastDayOfYearByEURO =
              candle.close[0] *
              (await Helper.getExchangeRatesByDate(
                this.httpService,
                'EUR',
                this.minusOneDay(date),
              ));
            let assetPriceAtLastDayOfYearByTRY =
              candle.close[0] *
              (await Helper.getExchangeRatesByDate(
                this.httpService,
                'TRY',
                this.minusOneDay(date),
              ));

            if (asset.type == AssetType.INDEX) {
              assetPriceAtLastDayOfYearByTRY = assetPriceAtLastDayOfYearByUSD;
              assetPriceAtLastDayOfYearByUSD /=
                await Helper.getExchangeRatesByDate(
                  this.httpService,
                  'TRY',
                  this.minusOneDay(date),
                );

              assetPriceAtLastDayOfYearByEURO =
                assetPriceAtLastDayOfYearByUSD *
                (await Helper.getExchangeRatesByDate(
                  this.httpService,
                  'EUR',
                  this.minusOneDay(date),
                ));
            }

            let roiByUSD =
              (assetPriceAtLastDayOfYearByUSD * 100) / asset.averageCostByUSD -
              100;
            let roiByEURO =
              (assetPriceAtLastDayOfYearByEURO * 100) /
                asset.averageCostByEURO -
              100;
            let roiByTRY =
              (assetPriceAtLastDayOfYearByTRY * 100) / asset.averageCostByTRY -
              100;
            let assetEndValueByUSD =
              (asset.totalInvestedByUSD * (100 + roiByUSD)) / 100;
            let assetEndValueByEURO =
              (asset.totalInvestedByEURO * (100 + roiByEURO)) / 100;
            let assetEndValueByTRY =
              (asset.totalInvestedByTRY * (100 + roiByTRY)) / 100;

            currentInvestment.byUSD += assetEndValueByUSD;
            currentInvestment.byEURO += assetEndValueByEURO;
            currentInvestment.byTRY += assetEndValueByTRY;
          }
        }
      } catch (error) {}
    });

    await Promise.all(result);

    return currentInvestment;
  }

  findAll() {
    return `This action returns all portfolioYearlyChange`;
  }

  findOne(id: number) {
    return `This action returns a #${id} portfolioYearlyChange`;
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

  update(
    id: number,
    updatePortfolioYearlyChangeDto: UpdatePortfolioYearlyChangeDto,
  ) {
    return `This action updates a #${id} portfolioYearlyChange`;
  }

  remove(id: number) {
    return `This action removes a #${id} portfolioYearlyChange`;
  }
}
