import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  IsEnum,
  NotEquals,
  Max,
  Min,
} from 'class-validator';
import { AssetType } from 'generated/prisma/client';

export class RequestCurrentAssetPriceDto {
  @IsNumber()
  id: number;

  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  symbol: string;

  @IsNumber({}, { message: 'averageCostByUSD must be a number' })
  @IsNotEmpty()
  averageCostByUSD: number;

  @IsNumber({}, { message: 'totalRawInvestmentByUSD must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByUSD: number;

  @IsEnum(AssetType, { message: 'Type must be a valid AssetType' })
  type: AssetType;
}
