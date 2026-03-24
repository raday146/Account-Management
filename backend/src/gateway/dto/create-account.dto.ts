import { IsNumber, IsInt, Min } from 'class-validator';

export class CreateAccountDto {
  @IsInt()
  personId: number;

  @IsNumber()
  @Min(0)
  dailyWithdrawalLimit: number;

  @IsInt()
  accountType: number;
}
