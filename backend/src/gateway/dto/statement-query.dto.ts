import { IsDateString, IsOptional } from 'class-validator';

export class StatementQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
