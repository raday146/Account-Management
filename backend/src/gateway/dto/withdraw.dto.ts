import { IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(0.01)
  value: number;
}
