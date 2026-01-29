import { AssetType } from 'generated/prisma';
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
export class Helper {
  static findURLForChartByAssetType(
    date: string,
    type: string,
    symbol: string,
  ): string {
    let url = '';

    let startDate = Math.floor(new Date(date).getTime() / 1000);
    date = new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      .toISOString()
      .split('T')[0];
    let endDate = Math.floor(new Date(date).getTime() / 1000);

    date = new Date(new Date(date).setDate(new Date(date).getDate() - 1))
      .toISOString()
      .split('T')[0];

    switch (type) {
      case AssetType.ETF:
        url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;

        break;

      case AssetType.INDEX:
        url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol === 'XU100' ? 'XU100.IS' : symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
        break;
      case AssetType.CRYPTO:
        startDate = new Date(date).getTime();
        url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1d&startTime=${startDate}&endTime=${startDate}`;
        break;
    }

    return url;
  }

  static async getCurrencyPrice(httpService: HttpService, currency: string) {
    try {
      const response = await firstValueFrom(
        httpService.get('https://open.exchangerate-api.com/v6/latest/USD'),
      );

      return response.data.rates[currency];
    } catch (error) {
      throw error;
    }
  }

  static async getExchangeRatesByDate(
    httpService: HttpService,
    currency: string,
    date: string,
  ): Promise<number> {
    try {
      const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`;

      const response = await firstValueFrom(httpService.get(url));

      const rate = response.data?.usd?.[currency.toLocaleLowerCase()];

      if (!rate) {
        throw new BadRequestException(`Rate not found for usd → ${currency}`);
      }
      return rate;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch exchange rate`);
    }
  }

    static async getExchangeRatesByDate_secondver(
    httpService: HttpService,
    currency: string,
    date: string,
  ): Promise<number> {
    try {
      const url = `https://api.frankfurter.app/${date}?from=USD`;

      const response = await firstValueFrom(httpService.get(url));

      const rate = response.data?.rates?.[currency.toLocaleUpperCase()];

      if (!rate) {
        throw new BadRequestException(`Rate not found for usd → ${currency}`);
      }
      return rate;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch exchange rate`);
    }
  }

  static getLastDayOfYear(year?: number): Date {
    const targetYear = year ?? new Date().getFullYear();
    return new Date(targetYear, 11, 31);
  }

  // Alternative: returns formatted string
  static getLastDayOfYearString(year?: number): string {
    const lastDay = this.getLastDayOfYear(year);
    return lastDay.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }
}
