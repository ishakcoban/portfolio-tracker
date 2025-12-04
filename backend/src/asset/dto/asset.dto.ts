import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  Min,
  Max,
  IsUrl,
  NotEquals,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { AssetType } from 'generated/prisma/client';


export class AssetDto {
  @IsNumber()
  id: number;
  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  @MinLength(3, { message: 'Symbol must be at least 3 characters' })
  @MaxLength(50, { message: 'Symbol cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Symbol contains invalid characters',
  })
  symbol: string;

  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByUSD: number;

  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByEURO: number;

  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  totalRawInvestmentByTRY: number;

  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  totalQuantity: number;
  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  averageCostByUSD: number;
  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  averageCostByEURO: number;
  @IsNumber({}, { message: 'Initial weight must be a number' })
  @IsNotEmpty()
  averageCostByTRY: number;
  @IsNotEmpty()
  type: AssetType;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsNotEmpty({ message: 'Image URL is required' })
  imageUrl: string;

  @IsNumber({}, { message: 'Initial weight must be a number' })
  @NotEquals(0, { message: 'Initial weight cannot be zero' })
  @Min(0, { message: 'Initial weight must be at least 0' })
  @Max(100, { message: 'Initial weight cannot exceed 100' })
  initialWeight: number;
  @IsInt()
  @IsOptional()
  portfolioId: number;
}
