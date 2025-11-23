import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { RequestCurrentAssetPriceDto } from './request/current-asset-price-request';
import { TransactionService } from 'src/transaction/transaction.service';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.create(createAssetDto);
  }
  @Get()
  findAll() {
    return this.assetService.findAll();
  }

  @Post('/current-market-price')
  getCurrentMarketPrice(
    @Body() requestCurrentAssetPriceDto: RequestCurrentAssetPriceDto[],
  ) {
    return this.assetService.getCurrentMarketPrice(requestCurrentAssetPriceDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(+id);
  }

  @Get(':id/transactions')
  findTransactionsByAssetId(@Param('id') id: string) {
    return this.transactionService.findAllByAssetId(+id);
  }

  @Get('line-chart/:id')
  getLineChartValues(@Param('id') id: string) {
    return this.assetService.getLineChartValues(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetService.update(+id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(+id);
  }
}
