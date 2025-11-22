import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Asset } from 'generated/prisma';
import { AssetDto } from 'src/asset/dto/asset.dto';

export class PortfolioDto {
  @IsInt()
  id: number;
  @IsString()
  name: string;
  @IsInt()
  totalRawInvestmentByUSD: number;
  @IsInt()
  totalRawInvestmentByEURO: number;
  @IsInt()
  totalRawInvestmentByTRY: number;
  
  @IsOptional()
  assets: AssetDto[];
}
