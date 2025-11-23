import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { RequestCurrentAssetPriceDto } from './request/current-asset-price-request';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AssetType } from 'generated/prisma';
import { CurrentMarketPriceResponse } from './response/current-market-price-response';
@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private portfolioService: PortfolioService,
    private readonly httpService: HttpService,
    private currentMarketPriceResponse: CurrentMarketPriceResponse,
  ) {}
  async create(createAssetDto: CreateAssetDto) {
    const portfolio = await this.portfolioService.findOne(
      createAssetDto.portfolioId,
    );
    const asset = await this.prisma.asset.findUnique({
      where: { symbol: createAssetDto.symbol },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio is not found!`);
    }

    if (asset) {
      throw new BadRequestException(
        `Portfolio with Symbol ${createAssetDto.symbol} is already taken!`,
      );
    }

    await this.prisma.asset.create({
      data: createAssetDto,
      include: {
        portfolio: true,
      },
    });
  }

  async getCurrentMarketPrice(
    requestCurrentAssetPrice: RequestCurrentAssetPriceDto[],
  ) {
    try {
      let totalRawInvestment = 0;
      let currentInvestment = 0;
      let currentEarning = 0;
      const result = await Promise.all(
        requestCurrentAssetPrice.map(async (asset) => {
          let url = '';

          switch (asset.type) {
            case AssetType.ETF || AssetType.INDEX:
              url =
                'https://query1.finance.yahoo.com/v8/finance/chart/' +
                asset.symbol;
              break;

            case AssetType.INDEX:
              url =
                'https://query1.finance.yahoo.com/v8/finance/chart/' +
                (asset.symbol === 'XU100'
                  ? asset.symbol + '.IS'
                  : asset.symbol);

              break;

            case AssetType.CRYPTO:
              url =
                'https://api.binance.com/api/v3/ticker/price?symbol=' +
                asset.symbol +
                'USDT';
              break;
          }

          const response = await firstValueFrom(this.httpService.get(url));

          const priceResponse: CurrentMarketPriceResponse = {
            currentPrice: 0,
            currentROI: 0,
            currentInvestment: 0,
            currentEarning: 0,
            currentWeight: 0,
            symbol: asset.symbol,
            type: asset.type,
          };

          switch (asset.type) {
            case AssetType.ETF:
              priceResponse.currentPrice = Number(
                Number(
                  response.data.chart.result[0].meta.regularMarketPrice,
                ).toFixed(2),
              );
              break;
            case AssetType.CRYPTO:
              priceResponse.currentPrice = Number(
                Number(response.data.price).toFixed(2),
              );
              break;
            case AssetType.INDEX:
              priceResponse.currentPrice = Number(
                Number(
                  response.data.chart.result[0].meta.regularMarketPrice /
                    (await this.getCurrencyPrice('TRY')),
                ).toFixed(2),
              );

              break;
          }

          priceResponse.currentROI = Number(
            (
              (priceResponse.currentPrice * 100) / asset.averageCostByUSD -
              100
            ).toFixed(2),
          );

          priceResponse.currentInvestment = Number(
            (
              (asset.totalRawInvestmentByUSD *
                (100 + priceResponse.currentROI)) /
              100
            ).toFixed(2),
          );
          totalRawInvestment += asset.totalRawInvestmentByUSD;
          currentInvestment += priceResponse.currentInvestment;
          priceResponse.currentEarning = Number(
            (
              priceResponse.currentInvestment - asset.totalRawInvestmentByUSD
            ).toFixed(2),
          );
          currentEarning += priceResponse.currentEarning;
          return priceResponse;
        }),
      );

      const updatedAssets = await this.calculateCurrentWeight(result);
      const updatedPortfolioPie = await this.createPortfolioPie(result);
      //const updatedLineChart = await this.calculateLineChartValues(result);

      return {
        currentROI: Number(
          ((currentInvestment * 100) / totalRawInvestment - 100).toFixed(2),
        ),
        currentEarning: Number(currentEarning.toFixed(2)),
        currentInvestment: Number(currentInvestment.toFixed(2)),
        assets: updatedAssets,
        portfolioPie: updatedPortfolioPie,
        // lineChart: updatedLineChart,
      };
    } catch (error) {
      throw error;
    }
  }

  async calculateCurrentWeight(assets: CurrentMarketPriceResponse[]) {
    let totalCurrentInvestment = 0;
    let portfolioCurrentRoi = 0;
    for (let i = 0; i < assets.length; i++) {
      totalCurrentInvestment += assets[i].currentInvestment;
      let currentTotalInvestment = 0;

      for (let j = 0; j < assets.length; j++) {
        if (i != j) {
          currentTotalInvestment += assets[j].currentInvestment;
        }
      }
      assets[i].currentWeight = Number(
        (
          (100 * assets[i].currentInvestment) /
          (assets[i].currentInvestment + currentTotalInvestment)
        ).toFixed(2),
      );
    }

    portfolioCurrentRoi = totalCurrentInvestment;

    return assets;
  }

  async createPortfolioPie(assets: CurrentMarketPriceResponse[]) {
    const portfolioPie: any = [];
    for (let i = 0; i < assets.length; i++) {
      const slice = {
        label: assets[i].symbol,
        value: assets[i].currentWeight,
      };

      portfolioPie.push(slice);
    }

    return portfolioPie;
  }

  async getLineChartValues(id: number) {
    try {
      const asset = await this.findOne(id);

      const response = await firstValueFrom(
        this.httpService.get(
          asset.type === AssetType.ETF || asset.type === AssetType.INDEX
            ? `https://query1.finance.yahoo.com/v8/finance/chart/${
                asset.symbol === 'XU100' ? 'XU100.IS' : asset.symbol
              }?interval=1d&range=360d`
            : asset.type === AssetType.CRYPTO
              ? `https://api.binance.com/api/v3/klines?symbol=${asset.symbol}USDT&interval=1d&limit=360`
              : '',
        ),
      );

      if (response.status == 200) {
        let prices: number[] = [];
        let timestamps: any[] = [];
        let result: any;
        let rawPrices: any;
        let labels: any;
        if (asset.type === AssetType.CRYPTO) {
          response.data.map((candle: string[]) => {
            timestamps.push(Math.floor(new Date(candle[0]).getTime() / 1000));
            prices.push(parseFloat(candle[4]));
          });
        } else {
          result = response.data.chart.result[0];

          timestamps = result.timestamp;

          rawPrices = result.indicators.quote[0].close;
          prices = rawPrices.map((price: number) => Math.round(price));
        }
        let day = 0;
        labels = prices.map((ts: number) => {
          day++;
          return 'Day ' + day;
        });

        return { pData: prices, xLabels: labels };
      }
    } catch (error) {}
  }

  async calculateLineChartValues(assets: CurrentMarketPriceResponse[]) {
    try {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const response = await firstValueFrom(
          this.httpService.get(
            asset.type === AssetType.ETF || asset.type === AssetType.INDEX
              ? `https://query1.finance.yahoo.com/v8/finance/chart/${
                  asset.symbol === 'XU100' ? 'XU100.IS' : asset.symbol
                }?interval=1d&range=360d`
              : asset.type === AssetType.CRYPTO
                ? `https://api.binance.com/api/v3/klines?symbol=${asset.symbol}USDT&interval=1d&limit=360`
                : '',
          ),
        );

        if (response.status == 200) {
          return response.data;
        }
      }
    } catch (error) {}

    // this.httpService.createHttpRequest(
    //   this.symbol == 'BTC' ||
    //     this.symbol == 'PAXG' ||
    //     this.symbol == 'ETH' ||
    //     this.symbol == 'XRP'
    //     ? `https://api.binance.com/api/v3/klines?symbol=${this.symbol}USDT&interval=1d&limit=15`
    //     : `https://query1.finance.yahoo.com/v8/finance/chart/${
    //         this.symbol === 'XU100'
    //           ? 'XU100.IS'
    //           : this.symbol === 'VIX'
    //             ? '%5EVIX'
    //             : this.symbol
    //       }?interval=1d&range=15d`,
    //   'GET',
    //   {},
    // );

    //return portfolioPie;
  }

  async getCurrencyPrice(currency: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://open.exchangerate-api.com/v6/latest/USD'),
      );

      return response.data.rates[currency];
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all asset`;
  }
  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
