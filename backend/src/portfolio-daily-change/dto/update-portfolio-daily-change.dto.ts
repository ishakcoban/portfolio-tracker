import { PartialType } from '@nestjs/mapped-types';
import { CreatePortfolioDailyChangeDto } from './create-portfolio-daily-change.dto';

export class UpdatePortfolioDailyChangeDto extends PartialType(CreatePortfolioDailyChangeDto) {}
