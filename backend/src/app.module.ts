import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database';
import { PersonModule } from './modules/person';
import { AccountModule } from './modules/account';
import { TransactionModule } from './modules/transaction';
import { GatewayModule } from './gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    DatabaseModule,
    PersonModule,
    AccountModule,
    TransactionModule,
    GatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
