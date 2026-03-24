import { Module } from '@nestjs/common';
import { AccountModule } from '../modules/account';
import { PersonModule } from '../modules/person';
import { AccountController, PersonController } from './controllers';

@Module({
  imports: [AccountModule, PersonModule],
  controllers: [AccountController, PersonController],
})
export class GatewayModule {}
