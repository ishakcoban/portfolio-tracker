import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma.service';
import { Asset, AssetType, Portfolio, Prisma } from 'generated/prisma';
import { PortfoliosDto } from './dto/find-all-portfolio.dto';
import { PortfolioMapper } from './portfolio.mapper';
import { RequestCurrentAssetPriceDto } from 'src/asset/request/current-asset-price-request';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { TransactionService } from 'src/transaction/transaction.service';
import { Helper } from 'src/utils/helpers';

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private portfolioMapper: PortfolioMapper,
    private readonly httpService: HttpService,
    private transactionService: TransactionService,
  ) {}
  async create(createPortfolioDto: CreatePortfolioDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { name: createPortfolioDto.name },
    });

    if (portfolio) {
      throw new BadRequestException(
        `Portfolio with Name ${createPortfolioDto.name} is already taken!`,
      );
    }

    await this.prisma.portfolio.create({
      data: createPortfolioDto,
    });
  }

  private mapToDto(portfolio: Portfolio): PortfoliosDto {
    return {
      id: portfolio.id,
      name: portfolio.name,
    };
  }

  async findAll() {
    const portfolios = await this.prisma.portfolio.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return portfolios;
  }

  async findOne(id: number) {
    try {
      const portfolio = await this.prisma.portfolio.findUniqueOrThrow({
        where: { id },
        include: {
          assets: {
            orderBy: {
              initialWeight: 'desc',
            },
            include: {
              transactions: true,
            },
          },
        },
      });
      return this.portfolioMapper.toDto(portfolio);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException(`Portfolio with ID ${id} not found`);
      }
      throw error;
    }
  }
  async calculatePortfolioValueForLightweightChart(id: number) {
    const portfolio = await this.findOne(id);

    const totalOriginalCapital = portfolio.totalRawInvestmentByUSD;
    let totalCurrentInvestmentByOpenPrice = 0;
    let totalCurrentInvestmentByHighPrice = 0;
    let totalCurrentInvestmentByLowPrice = 0;
    let totalCurrentInvestmentByClosePrice = 0;

    let indexInfo: {
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
    }[] = [];

    let data = {
      time: '',
      open: 0,
      high: 0,
      low: 0,
      close: 0,
    };

    for (const asset of portfolio.assets) {
      const url = Helper.findURLForChartByAssetType(asset.type, asset.symbol);
      try {
        const response = await firstValueFrom(this.httpService.get(url));

        if (response.status == 200) {
          let timestamps: any[] = [];
          if (asset.type === AssetType.CRYPTO) {
            response.data.forEach((candle: string[]) => {
              let open = parseFloat(candle[1]);
              let high = parseFloat(candle[2]);
              let low = parseFloat(candle[3]);
              let close = parseFloat(candle[4]);
              //console.log(close)
              let roiByOpenPrice =
                (open - asset.averageCostByUSD) / asset.averageCostByUSD;
              let currentAssetInvestmentByOpenPrice =
                asset.totalRawInvestmentByUSD * (1 + roiByOpenPrice);
              /** */
              let roiByHighPrice =
                (high - asset.averageCostByUSD) / asset.averageCostByUSD;
              let currentAssetInvestmentByHighPrice =
                asset.totalRawInvestmentByUSD * (1 + roiByHighPrice);
              /** */
              let roiByLowPrice =
                (low - asset.averageCostByUSD) / asset.averageCostByUSD;
              let currentAssetInvestmentByLowPrice =
                asset.totalRawInvestmentByUSD * (1 + roiByLowPrice);
              /** */
              let roiByClosePrice =
                (close - asset.averageCostByUSD) / asset.averageCostByUSD;
              let currentAssetInvestmentByClosePrice =
                asset.totalRawInvestmentByUSD * (1 + roiByClosePrice);
              /** */

              totalCurrentInvestmentByOpenPrice +=
                currentAssetInvestmentByOpenPrice;
              totalCurrentInvestmentByHighPrice +=
                currentAssetInvestmentByHighPrice;
              totalCurrentInvestmentByLowPrice +=
                currentAssetInvestmentByLowPrice;
              totalCurrentInvestmentByClosePrice +=
                currentAssetInvestmentByClosePrice;

              data.time = new Date(candle[0]).toISOString().split('T')[0];
            });

            // response.data.map((candle: string[]) => {
            //   let open = parseFloat(candle[1]);
            //   let high = parseFloat(candle[2]);
            //   let low = parseFloat(candle[3]);
            //   let close = parseFloat(candle[4]);
            //   //console.log(close)
            //   let roi =
            //     (close - asset.averageCostByUSD) / asset.averageCostByUSD;
            //   let currentAssetInvestmentByClosePrice =
            //     asset.totalRawInvestmentByUSD * (1 + roi);
            //
            //   // console.log(currentAssetInvestmentByClosePrice)
            //   //let date = new Date(candle[0]).toISOString().split('T')[0];
            //
            //   // console.log(totalCurrentInvestment)
            //   return currentAssetInvestmentByClosePrice;
            // });
          } else {
            const data = response.data.chart.result[0];

            timestamps = data.timestamp;
            const quotes = data.indicators.quote[0];
            //console.log(timestamps);
            timestamps.forEach(async (t: number, i: number) => {
              let b =
                asset.type === AssetType.INDEX
                  ? await Helper.getCurrencyPrice(this.httpService, 'TRY')
                  : 1;

              let roiByOpenPrice =
                (quotes.open[i] / b - asset.averageCostByUSD) /
                asset.averageCostByUSD;

              let currentAssetInvestmentByOpenPrice =
                asset.totalRawInvestmentByUSD * (1 + roiByOpenPrice);
              /** */
              let roiByHighPrice =
                (quotes.high[i] / b - asset.averageCostByUSD) /
                asset.averageCostByUSD;

              let currentAssetInvestmentByHighPrice =
                asset.totalRawInvestmentByUSD * (1 + roiByHighPrice);
              /** */
              let roiByLowPrice =
                (quotes.low[i] / b - asset.averageCostByUSD) /
                asset.averageCostByUSD;

              let currentAssetInvestmentByLowPrice =
                asset.totalRawInvestmentByUSD * (1 + roiByLowPrice);
              /** */
              let roiByClosePrice =
                (quotes.close[i] / b - asset.averageCostByUSD) /
                asset.averageCostByUSD;

              let currentAssetInvestmentByClosePrice =
                asset.totalRawInvestmentByUSD * (1 + roiByClosePrice);
              /** */
              totalCurrentInvestmentByOpenPrice +=
                currentAssetInvestmentByOpenPrice;
              totalCurrentInvestmentByHighPrice +=
                currentAssetInvestmentByHighPrice;
              totalCurrentInvestmentByLowPrice +=
                currentAssetInvestmentByLowPrice;
              totalCurrentInvestmentByClosePrice +=
                currentAssetInvestmentByClosePrice;
            });
          }
        }
      } catch (error) {}
    }

    const roiByOpenPrice =
      (totalCurrentInvestmentByOpenPrice - totalOriginalCapital) /
      totalOriginalCapital;
    const roiByHighPrice =
      (totalCurrentInvestmentByHighPrice - totalOriginalCapital) /
      totalOriginalCapital;
    const roiByLowPrice =
      (totalCurrentInvestmentByLowPrice - totalOriginalCapital) /
      totalOriginalCapital;
    const roiByClosePrice =
      (totalCurrentInvestmentByClosePrice - totalOriginalCapital) /
      totalOriginalCapital;

    const indexValue = 100000 * (1 + roiByClosePrice);
    data.open = 100000 * (1 + roiByOpenPrice);
    data.high = 100000 * (1 + roiByHighPrice);
    data.low = 100000 * (1 + roiByLowPrice);
    data.close = 100000 * (1 + roiByClosePrice);
    indexInfo.push(data);
    //console.log(indexInfo);
    //console.log('totalOriginalCapital: ' + totalOriginalCapital);
    //console.log('totalCurrentInvestment: ' + totalCurrentInvestment);
    //console.log('index value: ' + indexValue);

    return indexInfo;

    // Build index starting from 100000
    // let indexValue = 100000;
    // averageCost.map((index, j) => {
    //   let prevDate = j - 1 <= 0 ? 0 : averageCost[j - 1].date;
    //   let actualDate = index.date;
    //   let nextDate =
    //     j + 1 >= averageCost.length ? 0 : averageCost[j + 1].date;
    //   //console.log("avergcc" + averageCost[j + 1].date)
    //   closePrices.map((item, i, arr) => {
    //     if (
    //       j == averageCost.length - 1 &&
    //       actualDate > item.date &&
    //       nextDate > item.date
    //     ) {
    // const prevClose = arr[i - 1].close;
    // const roi = item.close / prevClose - 1;
    // indexValue =
    //   indexValue *
    //   ((100 + ((prevClose * 100) / index.averageCost - 100)) / 100);
    // result.push({
    //   date: item.date,
    //   close: item.close,
    //   averageCost: 0,
    //   roi: roi,
    //   index: indexValue,
    // });
    //   }
    //     });
    //   });
    // }

    //return result;
  }

  async update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    await this.findOne(id);

    await this.prisma.portfolio.update({
      where: { id },
      data: updatePortfolioDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.portfolio.delete({
      where: { id },
    });
  }

  async getFearAndGreedIndex() {
    let data: {
      vix: {
        type: string;
        value: number;
      };
      crypto: {
        type: string;
        value: number;
      };
    } = {
      vix: {
        type: 'VIX',
        value: 0,
      },
      crypto: {
        type: 'CRYPTO',
        value: 0,
      },
    };

    // for vix
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=1d&range=1d',
        ),
      );

      if (response.status == 200) {
        data.vix.value = +response.data.chart.result[0].meta.regularMarketPrice;
      }
    } catch (error) {}

    // for crypto
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.alternative.me/fng/?limit=1'),
      );

      if (response.status == 200) {
        data.crypto.value = +response.data.data[0].value;
      }
    } catch (error) {}

    return data;
  }
}
