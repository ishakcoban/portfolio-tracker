import { Portfolio } from "generated/prisma";
import { PortfoliosDto } from "./dto/find-all-portfolio.dto";
import { CreatePortfolioDto } from "./dto/create-portfolio.dto";
import { PortfolioDto } from "./dto/find-one-portfolio-dto";

export class PortfolioMapper {
  //constructor(private readonly photoMapper: AdvertPhotoMapper) {}

//     mapToDto(portfolios: Portfolio[]): PortfoliosDto[] {

//         portfolios.map
//     return {
//       id: portfolio.id,
//       name: portfolio.name,
//     };
    
//   }
  

//   toDto(portfolio: Portfolio): PortfolioDto {
//     return {
//       id: portfolio.id,
//       header: advert.header,
//       description: advert.description,
//       price: Number(advert.price),
//       city: advert.city,
//       district: advert.district,
//       neighbourhood: advert.neighbourhood,
//       rooms: advert.rooms,
//       floorArea: advert.floorArea,
//       updatedOn: advert.updatedOn,
//       userName: advert.user.userName,
//       photos: this.photoMapper.toDtoList(advert.advertPhotos),
//     };
//   }

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