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
      totalRawInvestmentByUSD: Number(
        Number(asset.totalRawInvestmentByUSD).toFixed(2),
      ),

      totalRawInvestmentByEURO: Number(
        Number(asset.totalRawInvestmentByEURO).toFixed(2),
      ),
      totalRawInvestmentByTRY: Number(
        Number(asset.totalRawInvestmentByTRY).toFixed(2),
      ),
      totalQuantity: Number(Number(asset.totalQuantity).toFixed(2)),
      averageCostByUSD: Number(Number(asset.averageCostByUSD).toFixed(2)),
      averageCostByEURO: Number(Number(asset.averageCostByEURO).toFixed(2)),
      averageCostByTRY: Number(Number(asset.averageCostByTRY).toFixed(2)),
      type: asset.type,
      imageUrl: asset.imageUrl,
      initialWeight: asset.initialWeight,
    };
  }

  toDtoList(assets: Asset[]): AssetDto[] {
    return assets.map((a) => this.toDto(a));
  }
}
