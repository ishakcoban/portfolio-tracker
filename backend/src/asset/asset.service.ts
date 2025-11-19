import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { PortfolioService } from 'src/portfolio/portfolio.service';

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private portfolioService: PortfolioService,
  ) {}
  async create(createAssetDto: CreateAssetDto) {
    // Verify portfolio exists
    const portfolio = await this.portfolioService.findOne(
      createAssetDto.portfolioId,
    );

    if (!portfolio) {
      throw new NotFoundException(
        `Portfolio with ID ${createAssetDto.portfolioId} not found`,
      );
    }
    await this.prisma.asset.create({
      data: createAssetDto,
      include: {
        portfolio: true,
      },
    });
  }

  findAll() {
    return `This action returns all asset`;
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
