import { Module } from '@nestjs/common';

import { ComplaintsController } from './complaints.controller';

@Module({
  imports: [],
  controllers: [ComplaintsController],
  providers: [],
  exports: [],
})
export class ComplaintsModule {}
