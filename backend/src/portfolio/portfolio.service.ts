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
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Helper } from 'src/utils/helpers';
import { CurrentMarketPriceResponse } from 'src/asset/response/current-market-price-response';

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private portfolioMapper: PortfolioMapper,
    private readonly httpService: HttpService,
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

    return await this.prisma.portfolio.create({
      data: createPortfolioDto,
      select: {
        id: true,
      },
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
        assets: true,
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
            where: {
              transactions: {
                some: {},
              },
            },
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

  async getCurrencies() {
    const date = new Date(Date.now()).toISOString().split('T')[0];

    const data = {
      usdtry: 0,
      eurtry: 0,
    };

    const usdtry = await Helper.getExchangeRatesByDate(
      this.httpService,
      'TRY',
      date,
    );
    const usdeur = await Helper.getExchangeRatesByDate(
      this.httpService,
      'EUR',
      date,
    );

    data.usdtry = usdtry;
    data.eurtry = usdtry / usdeur;

    return data;
  }

  async getByWeightDeviation(id: number) {
    const portfolio = await this.prisma.portfolio.findUniqueOrThrow({
      where: { id: id },
      include: { assets: true },
    });

    let weightData: {
      id: number;
      symbol: string;
      initialWeight: number;
      currentWeight: number;
      weightDeviation: number;
    };

    let currentAssetInvestments =
      await this.getCurrentAssetInvestmentsWithTotalCurrentInvestment(
        portfolio.assets,
      );
    const overWeightedAssets: any = [];
    const underWeightedAssets: any = [];
    portfolio.assets.map((asset) => {
      currentAssetInvestments?.currentAssetInvestments.map((item) => {
        if (asset.id == item.id) {
          let currentAssetWeight =
            (item.current /
              currentAssetInvestments.totalCurrentInvestmentByUSD) *
            100;
          let weightDeviation =
            ((currentAssetWeight - asset.initialWeight) / 100) *
            currentAssetInvestments.totalCurrentInvestmentByUSD;

          if (weightDeviation > 0) {
            overWeightedAssets.push({
              id: asset.id,
              symbol: asset.symbol,
              initialWeight: asset.initialWeight,
              currentWeight: currentAssetWeight,
              weightDeviation: weightDeviation,
            });
          }
          if (weightDeviation <= 0) {
            underWeightedAssets.push({
              id: asset.id,
              symbol: asset.symbol,
              initialWeight: asset.initialWeight,
              currentWeight: currentAssetWeight,
              weightDeviation: weightDeviation,
            });
          }
        }
      });
    });

    return {
      overweight: overWeightedAssets,
      underweight: underWeightedAssets,
    };
  }

  async getCurrentAssetInvestmentsWithTotalCurrentInvestment(assets: Asset[]) {
    try {
      let totalCurrentInvestmentByUSD = 0;
      let currentAssetPriceByUSD = 0;
      let currentAssetInvestments: {
        id: number;
        current: number;
      }[] = [];
      let roi = 0;
      const date = new Date(Date.now()).toISOString().split('T')[0];
      await Promise.all(
        assets.map(async (asset) => {
          const url = Helper.findURLForChartByAssetType(
            date,
            asset.type,
            asset.symbol,
          );
          const response = await firstValueFrom(this.httpService.get(url));
          if (response.status == 200) {
            switch (asset.type) {
              case AssetType.ETF:
                currentAssetPriceByUSD =
                  response.data.chart.result[0].meta.regularMarketPrice;
                roi =
                  (currentAssetPriceByUSD - asset.averageCostByUSD) /
                  asset.averageCostByUSD;
                totalCurrentInvestmentByUSD +=
                  asset.totalInvestedByUSD * (1 + roi);

                currentAssetInvestments.push({
                  id: asset.id,
                  current: asset.totalInvestedByUSD * (1 + roi),
                });
                break;
              case AssetType.CRYPTO:
                let candle = response.data[0];
                currentAssetPriceByUSD = parseFloat(candle[4]);
                roi =
                  (currentAssetPriceByUSD - asset.averageCostByUSD) /
                  asset.averageCostByUSD;
                totalCurrentInvestmentByUSD +=
                  asset.totalInvestedByUSD * (1 + roi);
                currentAssetInvestments.push({
                  id: asset.id,
                  current: asset.totalInvestedByUSD * (1 + roi),
                });
                break;
              case AssetType.INDEX:
                currentAssetPriceByUSD = Number(
                  Number(
                    response.data.chart.result[0].meta.regularMarketPrice /
                      (await Helper.getExchangeRatesByDate(
                        this.httpService,
                        'TRY',
                        date,
                      )),
                  ).toFixed(2),
                );

                roi =
                  (currentAssetPriceByUSD - asset.averageCostByUSD) /
                  asset.averageCostByUSD;
                totalCurrentInvestmentByUSD +=
                  asset.totalInvestedByUSD * (1 + roi);
                currentAssetInvestments.push({
                  id: asset.id,
                  current: asset.totalInvestedByUSD * (1 + roi),
                });
                break;
            }
          }
        }),
      );

      return {
        totalCurrentInvestmentByUSD: totalCurrentInvestmentByUSD,
        currentAssetInvestments: currentAssetInvestments,
      };
    } catch (error) {}
  }
  async update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    await this.findOne(id);

    await this.prisma.portfolio.update({
      where: { id },
      data: updatePortfolioDto,
    });
  }

  async remove(id: number) {
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
