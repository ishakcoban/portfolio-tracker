import { Asset, AssetType } from 'generated/prisma';
import { AssetDto } from './dto/asset.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssetMapper {
  toDto(asset: Asset): AssetDto {
    return {
      id: asset.id,
      symbol: asset.symbol,
      portfolioId: asset.portfolioId,
      totalRawInvestmentByUSD: asset.totalInvestedByUSD,
      totalRawInvestmentByEURO: asset.totalInvestedByEURO,
      totalRawInvestmentByTRY: asset.totalInvestedByTRY,
      totalQuantity: asset.totalQuantity,
      averageCostByUSD: asset.averageCostByUSD,
      averageCostByEURO: asset.averageCostByEURO,
      averageCostByTRY: asset.averageCostByTRY,
      type: asset.type,
      imageUrl: asset.imageUrl,
      initialWeight: asset.initialWeight,
    };
  }

  toDtoList(assets: Asset[]): AssetDto[] {
    return assets.map((a) => this.toDto(a));
  }
}
