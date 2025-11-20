import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { Asset } from 'generated/prisma';

export class PortfolioDto {
  id:string
  name: string;
  totalRawInvestmentByUSD  :number
  totalRawInvestmentByEURO :number
  totalRawInvestmentByTRY  :number
  totalQuantity            :number
  averageCostByUSD         :number
  averageCostByEURO        :number
  averageCostByTRY         :number
  assets                   :Asset[]
}