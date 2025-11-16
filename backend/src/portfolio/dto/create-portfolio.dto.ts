import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

export class CreatePortfolioDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9\s]+$/, { message: 'Name contains invalid characters' })
  name: string;
}