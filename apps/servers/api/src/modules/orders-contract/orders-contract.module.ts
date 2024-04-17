import { Module } from '@nestjs/common';

import { AlchemyModule } from '../alchemy';

import { OrdersContractService } from './orders-contract.service';

@Module({
  imports: [AlchemyModule],
  providers: [OrdersContractService],
})
export class OrdersContractModule {}
