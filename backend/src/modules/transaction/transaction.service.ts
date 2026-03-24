import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionEntity } from './transaction.entity';

/**
 * Service for managing Transaction entities and business logic
 */
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  /**
   * Find a transaction by ID
   */
  async findById(transactionId: number): Promise<TransactionEntity | null> {
    return this.transactionRepository.findOne({
      where: { transactionId },
    });
  }

  /**
   * Find a transaction by ID with account relation
   */
  async findByIdWithAccount(
    transactionId: number,
  ): Promise<TransactionEntity | null> {
    return this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['account'],
    });
  }

  /**
   * Find all transactions for an account
   */
  async findByAccountId(accountId: number): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
      where: { accountId },
      order: { transactionDate: 'DESC' },
    });
  }

  /**
   * Find transactions by account ID within date range
   */
  async findByAccountIdAndDateRange(
    accountId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
      where: {
        accountId,
        transactionDate: Between(startDate, endDate),
      },
      order: { transactionDate: 'DESC' },
    });
  }

  /**
   * Find all transactions
   */
  async findAll(): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
      order: { transactionDate: 'DESC' },
    });
  }

  /**
   * Create a new transaction
   */
  async create(data: Partial<TransactionEntity>): Promise<TransactionEntity> {
    const transaction = this.transactionRepository.create(data);
    return this.transactionRepository.save(transaction);
  }

  /**
   * Get total transaction value for an account
   */
  async getTotalValueByAccountId(accountId: number): Promise<number> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.value)', 'total')
      .where('transaction.accountId = :accountId', { accountId })
      .getRawOne<{ total: string | null }>();
    return parseFloat(result?.total ?? '0');
  }

  /**
   * Get total withdrawal amount for today
   */
  async getTodayWithdrawalTotal(accountId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const transactions = await this.transactionRepository.find({
      where: {
        accountId,
        transactionDate: Between(today, tomorrow),
      },
    });
    return transactions
      .filter((t) => parseFloat(t.value) < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.value)), 0);
  }

  /**
   * Count transactions for an account
   */
  async countByAccountId(accountId: number): Promise<number> {
    return this.transactionRepository.count({
      where: { accountId },
    });
  }

  /**
   * Delete a transaction
   */
  async delete(transactionId: number): Promise<boolean> {
    const result = await this.transactionRepository.delete(transactionId);
    return (result.affected ?? 0) > 0;
  }
}
