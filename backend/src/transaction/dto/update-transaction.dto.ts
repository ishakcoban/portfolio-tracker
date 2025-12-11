import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionRequest } from '../request/createTransactionRequest';

export class UpdateTransactionDto extends PartialType(CreateTransactionRequest) {}
