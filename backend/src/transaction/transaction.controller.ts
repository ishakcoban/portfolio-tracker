import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionRequest } from './request/createTransactionRequest';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionRequest: CreateTransactionRequest) {
    return this.transactionService.create(createTransactionRequest);
  }

  @Post('/bulk')
  createByBulk(@Body() createTransactionRequest: CreateTransactionRequest[]) {
    return this.transactionService.createByBulk(createTransactionRequest);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @Get(':id')
  findAllByAssetId(@Param('id') id: string) {
    return this.transactionService.findAllByAssetId(+id);
  }

  //@Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateTransactionDto: UpdateTransactionDto,
  // ) {
  //   return this.transactionService.update(+id, updateTransactionDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
