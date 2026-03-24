import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PersonEntity } from '../person/person.entity';
import { TransactionEntity } from '../transaction';

@Entity('account')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  accountId: number;

  @Column({ type: 'int' })
  personId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  balance: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  dailyWithdrawalLimit: string;

  @Column({ type: 'boolean', default: true })
  activeFlag: boolean;

  @Column({ type: 'int', default: 1 })
  accountType: number;

  @CreateDateColumn({ type: 'timestamp' })
  createDate: Date;

  @ManyToOne(() => PersonEntity, (person) => person.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'personId' })
  person: PersonEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.account)
  transactions: TransactionEntity[];
}
