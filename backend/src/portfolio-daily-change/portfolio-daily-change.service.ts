import { Injectable } from '@nestjs/common';
import { CreatePortfolioDailyChangeDto } from './dto/create-portfolio-daily-change.dto';
import { UpdatePortfolioDailyChangeDto } from './dto/update-portfolio-daily-change.dto';
import { PrismaService } from 'src/prisma.service';
import { Helper } from 'src/utils/helpers';
import { firstValueFrom, last } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AssetType, PortfolioDailyChange } from 'generated/prisma';
type ISODate = `${number}-${number}-${number}`; // yyyy-mm-dd
@Injectable()
export class PortfolioDailyChangeService {
  todayIndexValue: {
    id: number;
    open: number;
    high: number;
    low: number;
    close: number;
    portfolioId: number;
    time: string;
  };
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  create(createPortfolioDailyChangeDto: CreatePortfolioDailyChangeDto) {
    return 'This action adds a new portfolioDailyChange';
  }

  async findAll(id: number) {
    const portfolioDailyChanges =
      await this.prisma.portfolioDailyChange.findMany({
        where: { portfolioId: id },
        orderBy: { time: 'asc' },
      });

    await this.saveLostDateToDatabase(
      id,
      portfolioDailyChanges[portfolioDailyChanges.length - 1],
    );
    let dailyInfo = await this.prisma.portfolioDailyChange.findMany({
      where: { portfolioId: id },
    });
    dailyInfo.push(this.todayIndexValue);

    return dailyInfo;
  }

  async saveLostDateToDatabase(id: number, lastRecord: PortfolioDailyChange) {
    let date: ISODate = lastRecord
      ? this.addOneDay(lastRecord.time as ISODate)
      : '2025-11-20';
    const today: ISODate = new Date(Date.now())
      .toISOString()
      .split('T')[0] as ISODate;

    const tomorrow = this.addOneDay(today);

    const portfolio = await this.prisma.portfolio.findFirstOrThrow({
      where: { id: id },
      include: { assets: true },
    });
    const totalOriginalCapital = portfolio.totalInvestedByUSD;

    while (date !== tomorrow) {
      let assetRoiByOpenPrice = 0;
      let assetRoiByHighPrice = 0;
      let assetRoiByLowPrice = 0;
      let assetRoiByClosePrice = 0;

      let assetCurrentInvestmentByOpenPrice = 0;
      let assetCurrentInvestmentByHighPrice = 0;
      let assetCurrentInvestmentByLowPrice = 0;
      let assetCurrentInvestmentByClosePrice = 0;

      const InitialIndexValue = 10000;

      let loopData = {
        assetEarningByOpenPrice: 0,
        assetEarningByHighPrice: 0,
        assetEarningByLowPrice: 0,
        assetEarningByClosePrice: 0,
      };

      await Promise.all(
        portfolio.assets.map(async (asset) => {
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

                let open = parseFloat(candle[1]);
                let high = parseFloat(candle[2]);
                let low = parseFloat(candle[3]);
                let close = parseFloat(candle[4]);

                /*open price*/
                assetRoiByOpenPrice =
                  (open * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByOpenPrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByOpenPrice)) /
                  100;
                loopData.assetEarningByOpenPrice +=
                  assetCurrentInvestmentByOpenPrice - asset.totalInvestedByUSD;
                /*high price*/
                assetRoiByHighPrice =
                  (high * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByHighPrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByHighPrice)) /
                  100;
                loopData.assetEarningByHighPrice +=
                  assetCurrentInvestmentByHighPrice - asset.totalInvestedByUSD;
                /*low price*/
                assetRoiByLowPrice = (low * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByLowPrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByLowPrice)) / 100;
                loopData.assetEarningByLowPrice +=
                  assetCurrentInvestmentByLowPrice - asset.totalInvestedByUSD;
                /*close price*/
                assetRoiByClosePrice =
                  (close * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByClosePrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByClosePrice)) /
                  100;
                loopData.assetEarningByClosePrice +=
                  assetCurrentInvestmentByClosePrice - asset.totalInvestedByUSD;

                return loopData;
              } else {
                let data = response.data.chart.result[0];
                let updatedDate = date;
                timestamps = data.timestamp;

                while (timestamps == undefined) {
                  updatedDate = this.minusOneDay(updatedDate);

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

                let open = candle.open[0];
                let high = candle.high[0];
                let low = candle.low[0];
                let close = candle.close[0];

                if (asset.type == AssetType.INDEX) {
                  open /= await Helper.getExchangeRatesByDate(
                    this.httpService,
                    'TRY',
                    this.minusOneDay(date),
                  );
                  high /= await Helper.getExchangeRatesByDate(
                    this.httpService,
                    'TRY',
                    this.minusOneDay(date),
                  );
                  low /= await Helper.getExchangeRatesByDate(
                    this.httpService,
                    'TRY',
                    this.minusOneDay(date),
                  );
                  close /= await Helper.getExchangeRatesByDate(
                    this.httpService,
                    'TRY',
                    this.minusOneDay(date),
                  );
                }

                /*open price*/
                assetRoiByOpenPrice =
                  (open * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByOpenPrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByOpenPrice)) /
                  100;
                loopData.assetEarningByOpenPrice +=
                  assetCurrentInvestmentByOpenPrice - asset.totalInvestedByUSD;

                /*high price*/
                assetRoiByHighPrice =
                  (high * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByHighPrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByHighPrice)) /
                  100;
                loopData.assetEarningByHighPrice +=
                  assetCurrentInvestmentByHighPrice - asset.totalInvestedByUSD;

                /*low price*/
                assetRoiByLowPrice = (low * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByLowPrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByLowPrice)) / 100;
                loopData.assetEarningByLowPrice +=
                  assetCurrentInvestmentByLowPrice - asset.totalInvestedByUSD;

                /*close price*/
                assetRoiByClosePrice =
                  (close * 100) / asset.averageCostByUSD - 100;
                assetCurrentInvestmentByClosePrice =
                  (asset.totalInvestedByUSD * (100 + assetRoiByClosePrice)) /
                  100;
                loopData.assetEarningByClosePrice +=
                  assetCurrentInvestmentByClosePrice - asset.totalInvestedByUSD;
              }
            }
          } catch (error) {}
        }),
      );

      //await Promise.all(requests);

      let totalCurrentInvestmentByOpenPrice =
        totalOriginalCapital + loopData.assetEarningByOpenPrice;
      let roiByOpenPrice =
        (totalCurrentInvestmentByOpenPrice * 100) / totalOriginalCapital - 100;

      let totalCurrentInvestmentByHighPrice =
        totalOriginalCapital + loopData.assetEarningByHighPrice;
      let roiByHighPrice =
        (totalCurrentInvestmentByHighPrice * 100) / totalOriginalCapital - 100;

      let totalCurrentInvestmentByLowPrice =
        totalOriginalCapital + loopData.assetEarningByLowPrice;
      let roiByLowPrice =
        (totalCurrentInvestmentByLowPrice * 100) / totalOriginalCapital - 100;

      let totalCurrentInvestmentByClosePrice =
        totalOriginalCapital + loopData.assetEarningByClosePrice;
      let roiByClosePrice =
        (totalCurrentInvestmentByClosePrice * 100) / totalOriginalCapital - 100;

      if (date != today) {
        await this.prisma.portfolioDailyChange.create({
          data: {
            open: (InitialIndexValue * (100 + roiByOpenPrice)) / 100,
            high: (InitialIndexValue * (100 + roiByHighPrice)) / 100,
            low: (InitialIndexValue * (100 + roiByLowPrice)) / 100,
            close: (InitialIndexValue * (100 + roiByClosePrice)) / 100,
            portfolioId: id,
            time: date,
          },
        });
      } else {
        this.todayIndexValue = {
          id: -1,
          open: (InitialIndexValue * (100 + roiByOpenPrice)) / 100,
          high: (InitialIndexValue * (100 + roiByHighPrice)) / 100,
          low: (InitialIndexValue * (100 + roiByLowPrice)) / 100,
          close: (InitialIndexValue * (100 + roiByClosePrice)) / 100,
          portfolioId: id,
          time: date,
        };
      }

      date = this.addOneDay(date);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} portfolioDailyChange`;
  }

  update(
    id: number,
    updatePortfolioDailyChangeDto: UpdatePortfolioDailyChangeDto,
  ) {
    return `This action updates a #${id} portfolioDailyChange`;
  }

  remove(id: number) {
    return `This action removes a #${id} portfolioDailyChange`;
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
}
