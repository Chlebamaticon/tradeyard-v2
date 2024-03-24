import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from './entities';
import { EventRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [EventRepository],
  exports: [EventRepository],
})
export class CommonDatabaseModule {}
