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
  IsOptional,
} from 'class-validator';
import { AssetType } from 'generated/prisma/client';

export class CurrentAssetPriceRequest {
  @IsNumber()
  id: number;

  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  symbol: string;

  @IsNumber({}, { message: 'averageCostByUSD must be a number' })
  @IsNotEmpty()
  averageCostByUSD: number;

  @IsNumber({}, { message: 'averageCostByEURO must be a number' })
  @IsNotEmpty()
  averageCostByEURO: number;

  @IsNumber({}, { message: 'averageCostByTRY must be a number' })
  @IsNotEmpty()
  averageCostByTRY: number;

  @IsNumber({}, { message: 'totalRawInvestmentByUSD must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByUSD: number;

  @IsNumber({}, { message: 'totalRawInvestmentByEURO must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByEURO: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByTRY: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetROIByUSD: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetROIByEURO: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetROIByTRY: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetEarningByUSD: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetEarningByEURO: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetEarningByTRY: number;

    @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetPriceByUSD: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetPriceByEURO: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetPriceByTRY: number;

      @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetInvestmentByUSD: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetInvestmentByEURO: number;

  @IsNumber({}, { message: 'totalRawInvestmentByTRY must be a number' })
  @IsOptional()
  currentAssetInvestmentByTRY: number;

  @IsEnum(AssetType, { message: 'Type must be a valid AssetType' })
  type: AssetType;
}
