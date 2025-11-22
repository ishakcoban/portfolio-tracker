import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma.service';
import { Portfolio, Prisma } from 'generated/prisma';
import { PortfoliosDto } from './dto/find-all-portfolio.dto';
import { PortfolioMapper } from './portfolio.mapper';
import { RequestCurrentAssetPriceDto } from 'src/asset/request/current-asset-price-request';

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private portfolioMapper: PortfolioMapper,
  ) {}
  async create(createPortfolioDto: CreatePortfolioDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { name: createPortfolioDto.name },
    });

    if (portfolio) {
      throw new BadRequestException(
        `Portfolio with Name ${createPortfolioDto.name} is already taken!`,
      );
    }

    await this.prisma.portfolio.create({
      data: createPortfolioDto,
    });
  }

  private mapToDto(portfolio: Portfolio): PortfoliosDto {
    return {
      id: portfolio.id,
      name: portfolio.name,
    };
  }

  async findAll() {
    const portfolios = await this.prisma.portfolio.findMany({
      select: {
        id: true,
        name: true,
        assets: true,
      },
    });
    return portfolios;
  }

  async findOne(id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({ where: { id } });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    const assets = await this.prisma.asset.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: {
        initialWeight: 'desc',
      },
    });

    if (!assets) {
      throw new NotFoundException(`Assets not found`);
    }

    //const data = this.portfolioMapper.toDto(portfolio, assets);
console.log(portfolio)
    return this.portfolioMapper.toDto(portfolio, assets);
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
