import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';
import { AccountService } from './account.service';
import { TransactionEntity } from '../transaction/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, TransactionEntity])],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
