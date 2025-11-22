import { Asset, Portfolio } from 'generated/prisma';
import { PortfolioDto } from './dto/portfolio-dto';
import { AssetMapper } from 'src/asset/asset.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PortfolioMapper {
  constructor(private readonly assetMapper: AssetMapper) {}

  toDto(portfolio: Portfolio, assets: Asset[]): PortfolioDto {
    return {
      id: portfolio.id,
      name: portfolio.name,
      totalRawInvestmentByUSD: portfolio.totalRawInvestmentByUSD,
      totalRawInvestmentByEURO: portfolio.totalRawInvestmentByEURO,
      totalRawInvestmentByTRY: portfolio.totalRawInvestmentByTRY,
      assets: this.assetMapper.toDtoList(assets),
    };
  }

  /* toDtoList(adverts: (Advert & { user: User; advertPhotos: any[] })[]): AdvertDto[] {
    return adverts.map((a) => this.toDto(a));
  }*/

  /*createAdvert(
    advertRequest: AdvertRequest,
    userId: number
  ): Prisma.AdvertCreateInput {
    return {
      header: advertRequest.header,
      description: advertRequest.description,
      price: new Prisma.Decimal(advertRequest.price),
      city: advertRequest.city,
      district: advertRequest.district,
      neighbourhood: advertRequest.neighbourhood,
      rooms: advertRequest.rooms,
      floorArea: advertRequest.floorArea,
      user: {
        connect: { id: userId },
      },
    };
  }*/

  //   createAsset(createAssetDto: CreateAssetDto): Prisma.AssetCreateInput {
  //     return {
  //       symbol: createAssetDto.symbol,
  //       type: createAssetDto.type,
  //       totalAssetInvestmentByUSD: 0,
  //       totalAssetInvestmentByEURO: 0,
  //       totalAssetInvestmentByTRY: 0,
  //       totalAssetQuantity: 0,
  //       costByUSD: 0,
  //       costByEURO: 0,
  //       costByTRY: 0,
  //     };
  //   }
  //   updateAsset(
  //     existedAsset: Asset, // <-- correct type
  //     transaction: Prisma.TransactionCreateInput,
  //   ): Prisma.AssetUpdateInput {

  //     let updatedTotalAssetInvestmentByUSD =
  //       existedAsset.totalAssetInvestmentByUSD + transaction.investment;
  //     let updatedTotalAssetInvestmentByEURO =
  //       existedAsset.totalAssetInvestmentByEURO +
  //       transaction.investment / transaction.eurusd;
  //     let updatedTotalAssetInvestmentByTRY =
  //       existedAsset.totalAssetInvestmentByTRY +
  //       transaction.investment * transaction.usdtry;
  //     let updatedTotalAssetQuantity =
  //       existedAsset.totalAssetQuantity +
  //       transaction.investment / transaction.priceByUSD;
  //     return {
  //       totalAssetInvestmentByUSD: updatedTotalAssetInvestmentByUSD,
  //       totalAssetInvestmentByEURO: updatedTotalAssetInvestmentByEURO,
  //       totalAssetInvestmentByTRY: updatedTotalAssetInvestmentByTRY,
  //       totalAssetQuantity: updatedTotalAssetQuantity,
  //       costByUSD: updatedTotalAssetInvestmentByUSD / updatedTotalAssetQuantity,
  //       costByEURO: updatedTotalAssetInvestmentByEURO / updatedTotalAssetQuantity,
  //       costByTRY: updatedTotalAssetInvestmentByTRY / updatedTotalAssetQuantity,
  //     };
  //   }
}
