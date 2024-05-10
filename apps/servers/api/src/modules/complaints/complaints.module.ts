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
    CommonDatabaseModule,
  ],
  providers: [ComplaintService, ComplaintMessageService],
  exports: [ComplaintService, ComplaintMessageService],
})
export class ComplaintsModule {}
