import { AssetType } from 'generated/prisma';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
export class Helper {
  static findURLForChartByAssetType(type: string, symbol: string): string {
    let url = '';

    let endDate = Math.floor(new Date(Date.now()).getTime() / 1000);
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 1);
    start.setUTCHours(0, 0, 0, 0);
    let startDate = Math.floor(start.getTime() / 1000);
    startDate = Math.floor(new Date(Date.now()).getTime() / 1000);
    // const startDate = Math.floor(new Date("2025-11-20").getTime() / 1000);
    // const endDate = start + 86400;
    switch (type) {
      case AssetType.ETF:
        url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
        url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

        break;

      case AssetType.INDEX:
        url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol === 'XU100' ? 'XU100.IS' : symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
        url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol === 'XU100' ? 'XU100.IS' : symbol}?interval=1d&range=1d`;
        break;
      case AssetType.CRYPTO:
        endDate = Date.now();
        const start = new Date();
        start.setUTCDate(start.getUTCDate() - 1); // yesterday
        start.setUTCHours(0, 0, 0, 0); // 00:00:00 UTC

        startDate = start.getTime();
        startDate = Date.now();
        url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1d&startTime=${startDate}&endTime=${endDate}`;
        url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1d&limit=1`;
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
}
