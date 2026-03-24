import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AccountEntity } from './account.entity';
import { TransactionEntity } from '../transaction/transaction.entity';

/**
 * Service for managing Account entities and business logic
 */
@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new account
   */
  async createAccount(
    personId: number,
    dailyWithdrawalLimit: number,
    accountType: number,
  ): Promise<AccountEntity> {
    const account = this.accountRepository.create({
      personId,
      dailyWithdrawalLimit: dailyWithdrawalLimit.toFixed(2),
      accountType,
      balance: '0.00',
      activeFlag: true,
    });
    return this.accountRepository.save(account);
  }

  /**
   * Deposit money into an account
   * Uses database transaction with pessimistic locking
   */
  async deposit(accountId: number, value: number): Promise<AccountEntity> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(AccountEntity, {
        where: { accountId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      if (!account.activeFlag) {
        throw new BadRequestException('Account is not active');
      }
      const currentBalance = parseFloat(account.balance);
      const newBalance = (currentBalance + value).toFixed(2);
      account.balance = newBalance;
      await manager.save(AccountEntity, account);
      const transaction = manager.create(TransactionEntity, {
        accountId,
        value: value.toFixed(2),
      });
      await manager.save(TransactionEntity, transaction);
      return account;
    });
  }

  /**
   * Withdraw money from an account
   * Uses database transaction with pessimistic locking
   */
  async withdraw(accountId: number, value: number): Promise<AccountEntity> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(AccountEntity, {
        where: { accountId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      if (!account.activeFlag) {
        throw new BadRequestException('Account is not active');
      }
      const currentBalance = parseFloat(account.balance);
      if (currentBalance < value) {
        throw new BadRequestException('Insufficient balance');
      }
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const todayTransactions = await manager
        .createQueryBuilder(TransactionEntity, 'transaction')
        .where('transaction.accountId = :accountId', { accountId })
        .andWhere('transaction.transactionDate >= :todayStart', { todayStart })
        .andWhere('transaction.transactionDate <= :todayEnd', { todayEnd })
        .getMany();
      const todayWithdrawals = todayTransactions
        .filter((t) => parseFloat(t.value) < 0)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.value)), 0);
      const dailyLimit = parseFloat(account.dailyWithdrawalLimit);
      if (todayWithdrawals + value > dailyLimit) {
        throw new BadRequestException('Daily withdrawal limit exceeded');
      }
      const newBalance = (currentBalance - value).toFixed(2);
      account.balance = newBalance;
      await manager.save(AccountEntity, account);
      const transaction = manager.create(TransactionEntity, {
        accountId,
        value: (-value).toFixed(2),
      });
      await manager.save(TransactionEntity, transaction);
      return account;
    });
  }

  /**
   * Block an account (deactivate)
   */
  async blockAccount(accountId: number): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({
      where: { accountId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (!account.activeFlag) {
      throw new BadRequestException('Account is already blocked');
    }
    account.activeFlag = false;
    return this.accountRepository.save(account);
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: number): Promise<{
    accountId: number;
    balance: string;
    activeFlag: boolean;
  }> {
    const account = await this.accountRepository.findOne({
      where: { accountId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return {
      accountId: account.accountId,
      balance: account.balance,
      activeFlag: account.activeFlag,
    };
  }

  /**
   * Get account statement with transactions
   */
  async getStatement(
    accountId: number,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
    type?: 'deposit' | 'withdrawal',
  ): Promise<{
    accountId: number;
    balance: string;
    transactions: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const account = await this.accountRepository.findOne({
      where: { accountId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const transactionRepo = this.dataSource.getRepository(TransactionEntity);
    const queryBuilder = transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.accountId = :accountId', { accountId });

    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }
    queryBuilder.andWhere(
      'transaction.transactionDate BETWEEN :startDate AND :endDate',
      { startDate, endDate },
    );

    if (type) {
      if (type === 'deposit') {
        queryBuilder.andWhere('transaction.value >= 0');
      } else if (type === 'withdrawal') {
        queryBuilder.andWhere('transaction.value < 0');
      }
    }

    const total = await queryBuilder.getCount();

    const transactions = await queryBuilder
      .orderBy('transaction.transactionDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      accountId: account.accountId,
      balance: account.balance,
      transactions,
      total,
      page,
      limit,
    };
  }

  /**
   * Find an account by ID
   */
  async findById(accountId: number): Promise<AccountEntity | null> {
    return this.accountRepository.findOne({
      where: { accountId },
    });
  }

  /**
   * Find all accounts for a person
   */
  async findByPersonId(personId: number): Promise<AccountEntity[]> {
    return this.accountRepository.find({
      where: { personId },
    });
  }
}
