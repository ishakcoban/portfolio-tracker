import { Injectable } from '@nestjs/common';
import { IsDate, isDate, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, Min, NotEquals } from 'class-validator';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export class CreateTransactionRequest {
  @IsInt()
  assetId: number;
  @IsEnum(TransactionType, { message: 'Type must be a valid TransactionType' })
  type: TransactionType;
  @IsNumber({}, { message: 'Initial weight must be a number' })
  @NotEquals(0, { message: 'Initial weight cannot be zero' })
  @Min(0, { message: 'Initial weight must be at least 0' })
  investment: number;
  @IsNumber()
  usdtry: number;
  @IsNumber()
  eurusd: number;
  @IsNumber({}, { message: 'Initial weight must be a number' })
  @NotEquals(0, { message: 'Initial weight cannot be zero' })
  @Min(0, { message: 'Initial weight must be at least 0' })
  price: number;

  @IsDateString() // ensures the string is a valid ISO-8601 date
  date: string;
}
