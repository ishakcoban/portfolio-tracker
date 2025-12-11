import {
  IsDate,
  isDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
  NotEquals,
} from 'class-validator';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class SellTransactionRequest {
  @IsInt()
  assetId: number;

  @IsEnum(TransactionType, { message: 'Type must be a valid TransactionType' })
  type: TransactionType;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @NotEquals(0, { message: 'Quantity cannot be zero' })
  @Min(0, { message: 'Quantity must be at least 0' })
  quantity: number;

  @IsNumber({}, { message: 'Sale Price must be a number' })
  @NotEquals(0, { message: 'Sale Price cannot be zero' })
  @Min(0, { message: 'Sale Price must be at least 0' })
  salePrice: number;

  @IsDateString()
  date: string;
}
