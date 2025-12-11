import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsInt,
  IsOptional,
  Min,
  NotEquals,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Asset, TransactionType } from 'generated/prisma';
import { AssetDto } from 'src/asset/dto/asset.dto';

export class TransactionDto {
  @IsInt()
  id: number;
  @IsInt()
  assetId: number;

  @IsInt()
  quantity: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @NotEquals(0, { message: 'Price cannot be zero' })
  @Min(0, { message: 'Price must be at least 0' })
  price: number;
  
  @IsNumber({}, { message: 'Investment must be a number' })
  @NotEquals(0, { message: 'Investment cannot be zero' })
  @Min(0, { message: 'Investment must be at least 0' })
  investment: number;

  @IsEnum(TransactionType, { message: 'Type must be a valid TransactionType' })
  type: TransactionType;

  @IsNumber()
  usdtry: number;
  @IsNumber()
  eurusd: number;

  @IsDateString()
  date: string;
}
