import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  NotEquals,
} from 'class-validator';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class CreateTransactionRequest {
  @IsInt()
  assetId: number;
  @IsEnum(TransactionType, { message: 'Type must be a valid TransactionType' })
  type: TransactionType;
  @IsNumber({}, { message: 'Invested must be a number' })
  @NotEquals(0, { message: 'Invested cannot be zero' })
  @Min(0, { message: 'Invested must be at least 0' })
  invested: number;
  @IsNumber()
  usdtry: number;
  @IsNumber()
  eurusd: number;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @NotEquals(0, { message: 'Quantity cannot be zero' })
  @Min(0, { message: 'Quantity must be at least 0' })
  quantity: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @NotEquals(0, { message: 'Price cannot be zero' })
  @Min(0, { message: 'Price must be at least 0' })
  price: number;

  @IsDateString()
  date: string;
}
