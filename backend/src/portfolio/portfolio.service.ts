import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma.service';
import { Portfolio, Prisma } from 'generated/prisma';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}
  async create(createPortfolioDto: CreatePortfolioDto) {
    await this.prisma.portfolio.create({
      data: createPortfolioDto,
    });
  }

  async findAll() {
    return await this.prisma.portfolio.findMany();
  }

  async findOne(id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({ where: { id } });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return portfolio;
  }

  async update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    await this.findOne(id);

    await this.prisma.portfolio.update({
      where: { id },
      data: updatePortfolioDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.portfolio.delete({
      where: { id },
    });
  }
}
