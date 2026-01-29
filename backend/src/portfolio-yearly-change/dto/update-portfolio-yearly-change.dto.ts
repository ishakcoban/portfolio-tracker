import { PartialType } from '@nestjs/mapped-types';
import { CreatePortfolioYearlyChangeDto } from './create-portfolio-yearly-change.dto';

export class UpdatePortfolioYearlyChangeDto extends PartialType(CreatePortfolioYearlyChangeDto) {}
