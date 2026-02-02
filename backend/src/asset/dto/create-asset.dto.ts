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

export class CreateAssetDto {
  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  @MinLength(3, { message: 'Symbol must be at least 3 characters' })
  @MaxLength(50, { message: 'Symbol cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Symbol contains invalid characters',
  })
  symbol: string;

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
