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
import { TransactionService } from 'src/transaction/transaction.service';
import { AssetValueRequest } from './request/asset-value-request';
import { CreateAssetRequest } from './request/create-asset-request';
import { UpdateAssetRequest } from './request/update-asset-request';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  create(@Body() createAssetRequest: CreateAssetRequest) {
    return this.assetService.create(createAssetRequest);
  }
  @Get()
  findAll() {
    return this.assetService.findAll();
  }

  @Post('/asset-query')
  searchAssets(@Body() query: { source:string,symbol: string }) {
    return this.assetService.searchAssets(query);
  }

  @Post('/:id/asset-values')
  getassetValue(
    @Param('id') id: string,
    @Body() assetValueRequest: AssetValueRequest[],
  ) {
    return this.assetService.getAssetValues(assetValueRequest, +id);
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
  update(
    @Param('id') id: string,
    @Body() UpdateAssetRequest: UpdateAssetRequest,
  ) {
    return this.assetService.update(+id, UpdateAssetRequest);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(+id);
  }
}
