import { Module } from '@nestjs/common';

import { ComplaintMessagesController } from './complaint-messages.controller';
import { ComplaintsModule } from './complaints.module';

@Module({
  imports: [ComplaintsModule],
  controllers: [ComplaintMessagesController],
})
export class ComplaintMessagesRouteModule {}
