import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}
  async create(createTransactionDto: CreateTransactionDto) {

    console.log(createTransactionDto)
    // Verify portfolio exists
    // const portfolio = await this.portfolioService.findOne(
    //   createAssetDto.portfolioId,
    // );
    // const asset = await this.prisma.asset.findUnique({
    //   where: { symbol: createAssetDto.symbol },
    // });

    // if (!portfolio) {
    //   throw new NotFoundException(`Portfolio is not found!`);
    // }

    // if (asset) {
    //   throw new BadRequestException(
    //     `Portfolio with Symbol ${createAssetDto.symbol} is already taken!`,
    //   );
    // }

    await this.prisma.transaction.create({
    data: {
      ...createTransactionDto,
      date: new Date(createTransactionDto.date), // Prisma accepts JS Date object
    },
  });
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
