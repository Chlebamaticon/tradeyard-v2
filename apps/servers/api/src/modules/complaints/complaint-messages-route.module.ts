import { Module } from '@nestjs/common';

import { ComplaintsModule } from './complaints.module';
import { ComplaintMessagesController } from './controllers';

@Module({
  imports: [ComplaintsModule],
  controllers: [ComplaintMessagesController],
})
export class ComplaintMessagesRouteModule {}
