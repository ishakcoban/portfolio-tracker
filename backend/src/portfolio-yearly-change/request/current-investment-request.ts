import { IsNumber } from 'class-validator';

export class CurrentInvestmentRequest {
  @IsNumber()
  byUSD: number;
  @IsNumber()
  byEURO: number;
  @IsNumber()
  byTRY: number;
}
