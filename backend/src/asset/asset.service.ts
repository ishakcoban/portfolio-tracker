import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AssetValueRequest } from './request/asset-value-request';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AssetType } from 'generated/prisma';
import { CurrentMarketPriceResponse } from './response/current-market-price-response';
import { Helper } from 'src/utils/helpers';
import { CreateAssetRequest } from './request/create-asset-request';
import { UpdateAssetRequest } from './request/update-asset-request';
@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(createAssetRequest: CreateAssetRequest) {
    const portfolio = await this.prisma.portfolio.findFirstOrThrow({
      where: { id: createAssetRequest.portfolioId },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio is not found!`);
    }
    createAssetRequest.symbol = createAssetRequest.symbol
      .replace('USDT', '')
      .replace('.IS', '');
    await this.prisma.asset.create({
      data: createAssetRequest,
      include: {
        portfolio: true,
      },
    });
  }

  async searchByFinanceYahoo(query: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(
          `https://query1.finance.yahoo.com/v1/finance/search?q=${query}`,
        ),
      );
      if (res.status == 200) {
        console.log(res.data.quotes);
        return res.data.quotes;
      }
    } catch (error) {}
  }

  async searchByBinance(query: string) {
    const q = query.toUpperCase();
    // const symbols = await this.loadSymbols();
    //const now = Date.now();

    // refresh every 10 minutes
    // if (this.symbolsCache.length && now - this.lastUpdate < 600_000) {
    //   return this.symbolsCache;
    // }
    let symbolsCache: any[] = [];
    //private lastUpdate = 0;

    const res$ = this.httpService.get(
      'https://api.binance.com/api/v3/exchangeInfo',
    );
    const { data } = await firstValueFrom(res$);

    symbolsCache = data.symbols
      .filter((s) => s.status === 'TRADING')
      .map((s) => ({
        symbol: s.symbol,
      }));

    //this.lastUpdate = now;
    //console.log(this.symbolsCache);
    return symbolsCache.filter((s) => s.symbol.includes(q)).slice(0, 20); // limit results
  }

  async searchAssets(query: { source: string; symbol: string }) {
    switch (query.source) {
      case 'Yahoo Finance':
        return this.searchByFinanceYahoo(query.symbol);

      case 'Binance':
        return this.searchByBinance(query.symbol);
    }
  }

  // async loadSymbols() {
  //   const now = Date.now();

  //   // refresh every 10 minutes
  //   if (this.symbolsCache.length && now - this.lastUpdate < 600_000) {
  //     return this.symbolsCache;
  //   }

  //   const res$ = this.httpService.get(
  //     'https://api.binance.com/api/v3/exchangeInfo',
  //   );
  //   const { data } = await firstValueFrom(res$);

  //   this.symbolsCache = data.symbols
  //     .filter((s) => s.status === 'TRADING')
  //     .map((s) => ({
  //       symbol: s.symbol,
  //     }));

  //   this.lastUpdate = now;
  //   return this.symbolsCache;
  // }

  // async searchSymbols(query: string) {
  //   const q = query.toUpperCase();
  //   const symbols = await this.loadSymbols();

  //   return symbols.filter((s) => s.symbol.includes(q)).slice(0, 20); // limit results
  // }

  async getAssetValues(assetValueRequest: AssetValueRequest[], pID: number) {
    try {
      const date = new Date(Date.now()).toISOString().split('T')[0];
      const previousDate = Helper.minusOneDay(date);

      let totalRawInvestmentByUSD = 0;
      let totalRawInvestmentByEURO = 0;
      let totalRawInvestmentByTRY = 0;

      let currentInvestmentByUSD = 0;
      let currentInvestmentByEURO = 0;
      let currentInvestmentByTRY = 0;

      let currentEarningByUSD = 0;
      let currentEarningByEURO = 0;
      let currentEarningByTRY = 0;
      // const re = await Promise.all(Helper.deneme(assetValueRequest));
      const result = await Promise.all(
        assetValueRequest.map(async (asset) => {
          const url = Helper.findURLForChartByAssetType(
            date,
            asset.type,
            asset.symbol,
          );

          const url2 = Helper.findURLForChartByAssetType(
            previousDate,
            asset.type,
            asset.symbol,
          );

          const response = await firstValueFrom(this.httpService.get(url));
          const response2 = await firstValueFrom(this.httpService.get(url2));

          const priceResponse: CurrentMarketPriceResponse = {
            currentPriceByUSD: 0,
            currentPriceByEURO: 0,
            currentPriceByTRY: 0,
            previousDayPriceByUSD: 0,
            previousDayPriceByEURO: 0,
            previousDayPriceByTRY: 0,
            currentROIByUSD: 0,
            currentROIByEURO: 0,
            currentROIByTRY: 0,
            dailyROIByUSD: 0,
            dailyROIByEURO: 0,
            dailyROIByTRY: 0,
            currentEarningByUSD: 0,
            currentEarningByEURO: 0,
            currentEarningByTRY: 0,
            currentInvestmentByUSD: 0,
            currentInvestmentByEURO: 0,
            currentInvestmentByTRY: 0,
            currentWeight: 0,
            symbol: asset.symbol,
            type: asset.type,
            marketStatus: true,
          };

          let timestamps: any[] = [];
          let candle2: any;
          let data: any;
          switch (asset.type) {
            case AssetType.ETF:
              priceResponse.marketStatus = Helper.isMarketOpen(
                response.data.chart.result[0].meta,
              );

              priceResponse.previousDayPriceByUSD =
                response.data.chart.result[0].meta.chartPreviousClose;

              priceResponse.previousDayPriceByEURO =
                response.data.chart.result[0].meta.chartPreviousClose *
                (await Helper.getExchangeRatesByDate(
                  this.httpService,
                  'EUR',
                  previousDate,
                ));
              priceResponse.previousDayPriceByTRY =
                response.data.chart.result[0].meta.chartPreviousClose *
                (await Helper.getExchangeRatesByDate(
                  this.httpService,
                  'TRY',
                  previousDate,
                ));
              // today value
              priceResponse.currentPriceByUSD =
                response.data.chart.result[0].meta.regularMarketPrice;

              asset.currentAssetPriceByUSD = priceResponse.currentPriceByUSD;
              priceResponse.currentPriceByEURO =
                response.data.chart.result[0].meta.regularMarketPrice *
                (await Helper.getExchangeRatesByDate(
                  this.httpService,
                  'EUR',
                  date,
                ));
              asset.currentAssetPriceByEURO = priceResponse.currentPriceByEURO;
              priceResponse.currentPriceByTRY =
                response.data.chart.result[0].meta.regularMarketPrice *
                (await Helper.getExchangeRatesByDate(
                  this.httpService,
                  'TRY',
                  date,
                ));
              asset.currentAssetPriceByTRY = priceResponse.currentPriceByTRY;
              break;
            case AssetType.CRYPTO:
              // previous date value
              candle2 = response2.data[0];
              priceResponse.previousDayPriceByUSD = parseFloat(candle2[4]);
              priceResponse.previousDayPriceByEURO = Number(
                Number(
                  priceResponse.previousDayPriceByUSD *
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'EUR',
                      previousDate,
                    )),
                ).toFixed(2),
              );
              priceResponse.previousDayPriceByTRY = Number(
                Number(
                  priceResponse.previousDayPriceByUSD *
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'TRY',
                      previousDate,
                    )),
                ).toFixed(2),
              );
              // today value
              let candle = response.data[0];
              asset.currentAssetPriceByUSD = priceResponse.currentPriceByUSD;
              priceResponse.currentPriceByUSD = parseFloat(candle[4]);

              priceResponse.currentPriceByEURO = Number(
                Number(
                  priceResponse.currentPriceByUSD *
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'EUR',
                      date,
                    )),
                ).toFixed(2),
              );
              asset.currentAssetPriceByEURO = priceResponse.currentPriceByEURO;

              priceResponse.currentPriceByTRY = Number(
                Number(
                  priceResponse.currentPriceByUSD *
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'TRY',
                      date,
                    )),
                ).toFixed(2),
              );
              asset.currentAssetPriceByTRY = priceResponse.currentPriceByTRY;
              break;
            case AssetType.INDEX:
              priceResponse.marketStatus = Helper.isMarketOpen(
                response.data.chart.result[0].meta,
              );

              // previous date value
              let data = response2.data.chart.result[0];
              let updatedDate = previousDate;
              timestamps = data.timestamp;

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

              priceResponse.previousDayPriceByTRY =
                data.indicators.quote[0].close[0];

              priceResponse.previousDayPriceByUSD = Number(
                Number(
                  priceResponse.previousDayPriceByTRY /
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'TRY',
                      updatedDate,
                    )),
                ).toFixed(2),
              );
              priceResponse.previousDayPriceByEURO = Number(
                Number(
                  priceResponse.previousDayPriceByUSD *
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'EUR',
                      updatedDate,
                    )),
                ).toFixed(2),
              );
              // today value
              priceResponse.currentPriceByUSD = Number(
                Number(
                  response.data.chart.result[0].meta.regularMarketPrice /
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'TRY',
                      date,
                    )),
                ).toFixed(2),
              );

              asset.currentAssetPriceByUSD = priceResponse.currentPriceByUSD;

              priceResponse.currentPriceByEURO = Number(
                Number(
                  (
                    (response.data.chart.result[0].meta.regularMarketPrice /
                      (await Helper.getExchangeRatesByDate(
                        this.httpService,
                        'TRY',
                        date,
                      ))) *
                    (await Helper.getExchangeRatesByDate(
                      this.httpService,
                      'EUR',
                      date,
                    ))
                  ).toFixed(2),
                ),
              );
              asset.currentAssetPriceByEURO = priceResponse.currentPriceByEURO;

              priceResponse.currentPriceByTRY = Number(
                Number(
                  response.data.chart.result[0].meta.regularMarketPrice,
                ).toFixed(2),
              );

              asset.currentAssetPriceByTRY = priceResponse.currentPriceByTRY;

              break;
          }

          priceResponse.currentROIByUSD = Number(
            (
              (priceResponse.currentPriceByUSD * 100) / asset.averageCostByUSD -
              100
            ).toFixed(2),
          );
          asset.currentAssetROIByUSD = priceResponse.currentROIByUSD;
          priceResponse.currentROIByEURO = Number(
            (
              (priceResponse.currentPriceByEURO * 100) /
                asset.averageCostByEURO -
              100
            ).toFixed(2),
          );
          asset.currentAssetROIByEURO = priceResponse.currentROIByEURO;

          priceResponse.currentROIByTRY = Number(
            (
              (priceResponse.currentPriceByTRY * 100) / asset.averageCostByTRY -
              100
            ).toFixed(2),
          );
          asset.currentAssetROIByTRY = priceResponse.currentROIByTRY;

          priceResponse.currentInvestmentByUSD = Number(
            (
              (asset.totalRawInvestmentByUSD *
                (100 + priceResponse.currentROIByUSD)) /
              100
            ).toFixed(2),
          );
          asset.currentAssetInvestmentByUSD =
            priceResponse.currentInvestmentByUSD;
          priceResponse.currentInvestmentByEURO = Number(
            (
              (asset.totalRawInvestmentByEURO *
                (100 + priceResponse.currentROIByEURO)) /
              100
            ).toFixed(2),
          );
          asset.currentAssetInvestmentByEURO =
            priceResponse.currentInvestmentByEURO;
          priceResponse.currentInvestmentByTRY = Number(
            (
              (asset.totalRawInvestmentByTRY *
                (100 + priceResponse.currentROIByTRY)) /
              100
            ).toFixed(2),
          );
          asset.currentAssetInvestmentByTRY =
            priceResponse.currentInvestmentByTRY;
          totalRawInvestmentByUSD += asset.totalRawInvestmentByUSD;
          totalRawInvestmentByEURO += asset.totalRawInvestmentByEURO;
          totalRawInvestmentByTRY += asset.totalRawInvestmentByTRY;
          currentInvestmentByUSD += priceResponse.currentInvestmentByUSD;
          currentInvestmentByEURO += priceResponse.currentInvestmentByEURO;
          currentInvestmentByTRY += priceResponse.currentInvestmentByTRY;
          priceResponse.currentEarningByUSD = Number(
            (
              priceResponse.currentInvestmentByUSD -
              asset.totalRawInvestmentByUSD
            ).toFixed(2),
          );
          asset.currentAssetEarningByUSD = priceResponse.currentEarningByUSD;
          priceResponse.currentEarningByEURO = Number(
            (
              priceResponse.currentInvestmentByEURO -
              asset.totalRawInvestmentByEURO
            ).toFixed(2),
          );
          asset.currentAssetEarningByEURO = priceResponse.currentEarningByEURO;
          priceResponse.currentEarningByTRY = Number(
            (
              priceResponse.currentInvestmentByTRY -
              asset.totalRawInvestmentByTRY
            ).toFixed(2),
          );
          asset.currentAssetEarningByTRY = priceResponse.currentEarningByTRY;
          asset.currentAssetROIByUSD =
            (asset.currentAssetInvestmentByUSD * 100) /
              asset.totalRawInvestmentByUSD -
            100;
          asset.currentAssetROIByEURO =
            (asset.currentAssetInvestmentByEURO * 100) /
              asset.totalRawInvestmentByEURO -
            100;
          asset.currentAssetROIByTRY =
            (asset.currentAssetInvestmentByTRY * 100) /
              asset.totalRawInvestmentByTRY -
            100;

          priceResponse.dailyROIByUSD =
            ((priceResponse.currentPriceByUSD -
              priceResponse.previousDayPriceByUSD) /
              priceResponse.previousDayPriceByUSD) *
            100;

          priceResponse.dailyROIByEURO =
            ((priceResponse.currentPriceByEURO -
              priceResponse.previousDayPriceByEURO) /
              priceResponse.previousDayPriceByEURO) *
            100;
          priceResponse.dailyROIByTRY =
            ((priceResponse.currentPriceByTRY -
              priceResponse.previousDayPriceByTRY) /
              priceResponse.previousDayPriceByTRY) *
            100;
          currentEarningByUSD += priceResponse.currentEarningByUSD;
          currentEarningByEURO += priceResponse.currentEarningByEURO;
          currentEarningByTRY += priceResponse.currentEarningByTRY;
          return priceResponse;
        }),
      );

      const updatedAssets = await this.calculateCurrentWeight(result);
      const updatedPortfolioPie = await this.createPortfolioPie(result);
      const yearsCount = await this.prisma.portfolioYearlyChange.count({
        where: { portfolioId: pID },
      });

      return {
        currentROIByUSD:
          (currentInvestmentByUSD * 100) / totalRawInvestmentByUSD - 100,

        currentROIByEURO:
          (currentInvestmentByEURO * 100) / totalRawInvestmentByEURO - 100,
        currentROIByTRY:
          (currentInvestmentByTRY * 100) / totalRawInvestmentByTRY - 100,
        currentEarningByUSD: currentEarningByUSD,
        currentEarningByEURO: currentEarningByEURO,
        currentEarningByTRY: currentEarningByTRY,
        currentInvestmentByUSD: currentInvestmentByUSD,
        currentInvestmentByEURO: currentInvestmentByEURO,
        currentInvestmentByTRY: currentInvestmentByTRY,
        annualizedAverageROIByUSD:
          (Math.pow(
            currentInvestmentByUSD / totalRawInvestmentByUSD,
            1 / yearsCount,
          ) -
            1) *
          100,
        annualizedAverageROIByEURO:
          (Math.pow(
            currentInvestmentByEURO / totalRawInvestmentByEURO,
            1 / yearsCount,
          ) -
            1) *
          100,
        annualizedAverageROIByTRY:
          (Math.pow(
            currentInvestmentByTRY / totalRawInvestmentByTRY,
            1 / yearsCount,
          ) -
            1) *
          100,
        assets: updatedAssets,
        portfolioPie: updatedPortfolioPie,
      };
    } catch (error) {
      throw error;
    }
  }

  async calculateCurrentWeight(assets: CurrentMarketPriceResponse[]) {
    let totalCurrentInvestment = 0;
    let portfolioCurrentRoi = 0;
    for (let i = 0; i < assets.length; i++) {
      totalCurrentInvestment += assets[i].currentInvestmentByUSD;
      let currentTotalInvestment = 0;

      for (let j = 0; j < assets.length; j++) {
        if (i != j) {
          currentTotalInvestment += assets[j].currentInvestmentByUSD;
        }
      }
      assets[i].currentWeight = Number(
        (
          (100 * assets[i].currentInvestmentByUSD) /
          (assets[i].currentInvestmentByUSD + currentTotalInvestment)
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
              }?interval=1d&range=90d`
            : asset.type === AssetType.CRYPTO
              ? `https://api.binance.com/api/v3/klines?symbol=${asset.symbol}USDT&interval=1d&limit=90`
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
          prices = rawPrices.map((value, i) => {
            if (asset.symbol === 'XU100' && value === null) {
              return Math.round(i === 0 ? rawPrices[1] : rawPrices[i - 1]);
            }
            return Math.round(value);
          });
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

  findAll() {
    return `This action returns all asset`;
  }
  async findOne(id: number) {
    const asset = await this.prisma.asset.findUniqueOrThrow({ where: { id } });

    return asset;
  }

  async findOneWithTransactions(id: number) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: { id },
      include: { transactions: true },
    });

    return asset;
  }

  update(id: number, updateAssetRequest: UpdateAssetRequest) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
