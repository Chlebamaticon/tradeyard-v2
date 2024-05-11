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

import { ComplaintContractFacade } from './complaint-contract.facade';
import { ComplaintMessageService } from './complaint-message.service';
import { ComplaintService } from './complaint.service';

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
