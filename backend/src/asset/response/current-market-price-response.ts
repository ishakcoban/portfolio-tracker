import { AssetType } from "generated/prisma";

export class CurrentMarketPriceResponse {
  symbol: string;
  type: AssetType;
  currentPrice: number;
  currentROI: number;
  currentEarning: number;
  currentInvestment: number;
  currentWeight: number;
}
