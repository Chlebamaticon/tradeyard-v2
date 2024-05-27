import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  ComplaintMessageViewEntity,
  ComplaintViewEntity,
  CustomerViewEntity,
  MerchantViewEntity,
  OrderViewEntity,
} from '@tradeyard-v2/server/database';

import { AlchemyModule } from '../alchemy';

import { ComplaintContractFacade } from './facades';
import { ComplaintService, ComplaintMessageService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantViewEntity,
      CustomerViewEntity,
      OrderViewEntity,
      ComplaintViewEntity,
      ComplaintMessageViewEntity,
    ]),
    AlchemyModule,
    CommonDatabaseModule,
  ],
  providers: [
    ComplaintService,
    ComplaintMessageService,
    ComplaintContractFacade,
  ],
  exports: [ComplaintService, ComplaintMessageService, ComplaintContractFacade],
})
export class ComplaintsModule {}
