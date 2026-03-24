import { IsNumber, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(0.01)
  value: number;
}
