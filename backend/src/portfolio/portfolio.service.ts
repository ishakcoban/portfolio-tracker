import { Injectable } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma.service';
import { Portfolio, Prisma } from 'generated/prisma';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}
  create(createPortfolioDto: CreatePortfolioDto) {
    this.prisma.portfolio.create({
      data: createPortfolioDto,
    });
  }

  findAll() {
    return `This action returns all portfolio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} portfolio`;
  }

  update(id: number, updatePortfolioDto: UpdatePortfolioDto) {
    return `This action updates a #${id} portfolio`;
  }

  remove(id: number) {
    return `This action removes a #${id} portfolio`;
  }
}
