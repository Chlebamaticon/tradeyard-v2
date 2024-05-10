import { Module } from '@nestjs/common';

import { ComplaintsController } from './complaints.controller';
import { ComplaintsModule } from './complaints.module';

@Module({
  imports: [ComplaintsModule],
  controllers: [ComplaintsController],
})
export class ComplaintsRouteModule {}
