import { IsDateString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class StatementQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['deposit', 'withdrawal'])
  type?: 'deposit' | 'withdrawal';
}
