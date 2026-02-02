import { Injectable } from '@nestjs/common';
import { AssetType } from 'generated/prisma';

@Injectable()
export class CurrentMarketPriceResponse {
  symbol: string;
  type: AssetType;
  currentPriceByUSD: number;
  currentPriceByEURO: number;
  currentPriceByTRY: number;
  previousDayPriceByUSD: number;
  previousDayPriceByEURO: number;
  previousDayPriceByTRY: number;
  currentROIByUSD: number;
  currentROIByEURO: number;
  currentROIByTRY: number;
  dailyROIByUSD: number;
  dailyROIByEURO: number;
  dailyROIByTRY: number;
  currentEarningByUSD: number;
  currentEarningByEURO: number;
  currentEarningByTRY: number;
  currentInvestmentByUSD: number;
  currentInvestmentByEURO: number;
  currentInvestmentByTRY: number;
  currentWeight: number;
  marketStatus: boolean;
}
