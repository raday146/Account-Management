import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccountEntity } from '../account/account.entity';

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  transactionId: number;

  @Column({ type: 'int' })
  accountId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: string;

  @CreateDateColumn({ type: 'timestamp' })
  transactionDate: Date;

  @ManyToOne(() => AccountEntity, (account) => account.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;
}
