import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PortfolioYearlyChangeService } from './portfolio-yearly-change.service';
import { CreatePortfolioYearlyChangeDto } from './dto/create-portfolio-yearly-change.dto';
import { UpdatePortfolioYearlyChangeDto } from './dto/update-portfolio-yearly-change.dto';

@Controller('portfolio-yearly-change')
export class PortfolioYearlyChangeController {
  constructor(private readonly portfolioYearlyChangeService: PortfolioYearlyChangeService) {}

  @Post()
  create(@Body() createPortfolioYearlyChangeDto: CreatePortfolioYearlyChangeDto) {
    return this.portfolioYearlyChangeService.create(createPortfolioYearlyChangeDto);
  }

  @Get()
  findAll() {
    return this.portfolioYearlyChangeService.findAll();
  }

  @Get(':id')
  getYearlyChanges(@Param('id') pID: string) {
    return this.portfolioYearlyChangeService.getYearlyChanges(+pID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortfolioYearlyChangeDto: UpdatePortfolioYearlyChangeDto) {
    return this.portfolioYearlyChangeService.update(+id, updatePortfolioYearlyChangeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfolioYearlyChangeService.remove(+id);
  }
}
