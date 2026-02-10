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

export class CreateAssetRequest {
  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  @MinLength(3, { message: 'Symbol must be at least 3 characters' })
  @MaxLength(50, { message: 'Symbol cannot exceed 50 characters' })
  symbol: string;
  @IsString({ message: 'Long Name must be a string' })
  @IsNotEmpty({ message: 'Long Name is required' })
  @MaxLength(50, { message: 'Long Name cannot exceed 50 characters' })
  longName: string;

  @IsEnum(AssetType, { message: 'Type must be a valid AssetType' })
  type: AssetType;

  @IsNumber({}, { message: 'Initial weight must be a number' })
  @NotEquals(0, { message: 'Initial weight cannot be zero' })
  @Min(0, { message: 'Initial weight must be at least 0' })
  @Max(100, { message: 'Initial weight cannot exceed 100' })
  initialWeight: number;
  @IsInt()
  @IsOptional()
  portfolioId: number;
}
