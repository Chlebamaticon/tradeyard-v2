import { Module } from '@nestjs/common';

import { ComplaintsModule } from './complaints.module';
import { ComplaintsController } from './controllers';

@Module({
  imports: [ComplaintsModule],
  controllers: [ComplaintsController],
})
export class ComplaintsRouteModule {}
