import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PortfolioDailyChangeService } from './portfolio-daily-change.service';
import { CreatePortfolioDailyChangeDto } from './dto/create-portfolio-daily-change.dto';
import { UpdatePortfolioDailyChangeDto } from './dto/update-portfolio-daily-change.dto';

@Controller('portfolio-daily-changes')
export class PortfolioDailyChangeController {
  constructor(private readonly portfolioDailyChangeService: PortfolioDailyChangeService) {}

  @Post()
  create(@Body() createPortfolioDailyChangeDto: CreatePortfolioDailyChangeDto) {
    return this.portfolioDailyChangeService.create(createPortfolioDailyChangeDto);
  }

  @Get('portfolio/:id')
  findAll(@Param('id') id: string) {
    return this.portfolioDailyChangeService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfolioDailyChangeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortfolioDailyChangeDto: UpdatePortfolioDailyChangeDto) {
    return this.portfolioDailyChangeService.update(+id, updatePortfolioDailyChangeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfolioDailyChangeService.remove(+id);
  }
}
