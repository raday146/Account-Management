import { IsNumber, IsEnum, Min, IsInt } from 'class-validator';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}

export class CreateAccountDto {
  @IsInt()
  personId: number;

  @IsNumber()
  @Min(0)
  dailyWithdrawalLimit: number;

  @IsEnum(AccountType)
  accountType: AccountType;
}
