import { Prisma, Transaction } from 'generated/prisma';
import { Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaClient } from '@prisma/client/extension';
import { TransactionDto } from './dto/transaction-dto';

@Injectable()
export class TransactionMapper {
  constructor() {}

  toDto(transaction: Transaction): TransactionDto {
    return {
      id: transaction.id,
      assetId: transaction.assetId!,
      type: transaction.type,
      investment: transaction.invested,
      quantity: transaction.quantity,
      price: transaction.price,
      eurusd: transaction.eurusd,
      usdtry: transaction.usdtry,
      date: transaction.date.toISOString(),
    };
  }

  toDtoList(transactions: Transaction[]): TransactionDto[] {
    return transactions.map((a) => this.toDto(a));
  }

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

  updateTransaction(): UpdateTransactionDto {
    return {};
  }
}
