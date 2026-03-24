import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from '../../modules/account';
import { PersonService } from '../../modules/person';
import {
  CreateAccountDto,
  DepositDto,
  WithdrawDto,
  StatementQueryDto,
} from '../dto';

/**
 * Controller for account management endpoints
 */
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly personService: PersonService,
  ) {}

  /**
   * Create a new account
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    const account = await this.accountService.createAccount(
      createAccountDto.personId,
      createAccountDto.dailyWithdrawalLimit,
      createAccountDto.accountType,
    );
    return {
      success: true,
      message: 'Account created successfully',
      data: account,
    };
  }

  /**
   * Deposit money into an account
   */
  @Post(':id/deposit')
  @HttpCode(HttpStatus.OK)
  async deposit(
    @Param('id') accountId: number,
    @Body() depositDto: DepositDto,
  ) {
    const account = await this.accountService.deposit(
      accountId,
      depositDto.value,
    );
    return {
      success: true,
      message: 'Deposit successful',
      data: {
        accountId: account.accountId,
        balance: account.balance,
      },
    };
  }

  /**
   * Withdraw money from an account
   */
  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @Param('id') accountId: number,
    @Body() withdrawDto: WithdrawDto,
  ) {
    const account = await this.accountService.withdraw(
      accountId,
      withdrawDto.value,
    );
    return {
      success: true,
      message: 'Withdrawal successful',
      data: {
        accountId: account.accountId,
        balance: account.balance,
      },
    };
  }

  /**
   * Get account balance
   */
  @Get(':id/balance')
  @HttpCode(HttpStatus.OK)
  async getBalance(@Param('id') accountId: number) {
    const balanceInfo = await this.accountService.getBalance(accountId);
    return {
      success: true,
      message: 'Balance retrieved successfully',
      data: balanceInfo,
    };
  }

  /**
   * Block an account
   */
  @Patch(':id/block')
  @HttpCode(HttpStatus.OK)
  async blockAccount(@Param('id') accountId: number) {
    const account = await this.accountService.blockAccount(accountId);
    return {
      success: true,
      message: 'Account blocked successfully',
      data: {
        accountId: account.accountId,
        activeFlag: account.activeFlag,
      },
    };
  }

  /**
   * Get account statement
   */
  @Get(':id/statement')
  @HttpCode(HttpStatus.OK)
  async getStatement(
    @Param('id') accountId: number,
    @Query() query: StatementQueryDto,
  ) {
    const startDate = new Date(query.from);
    const endDate = new Date(query.to);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const type = query.type;

    const statement = await this.accountService.getStatement(
      accountId,
      startDate,
      endDate,
      page,
      limit,
      type,
    );
    return {
      success: true,
      message: 'Statement retrieved successfully',
      data: statement,
    };
  }
}
