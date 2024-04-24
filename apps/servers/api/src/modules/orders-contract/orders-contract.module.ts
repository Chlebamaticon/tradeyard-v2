import { Module } from '@nestjs/common';

import { CommonDatabaseModule } from '@tradeyard-v2/server/database';

import { AlchemyModule } from '../alchemy';

import { OrdersContractService } from './orders-contract.service';

@Module({
  imports: [AlchemyModule, CommonDatabaseModule],
  providers: [OrdersContractService],
  exports: [OrdersContractService],
})
export class OrdersContractModule {}
