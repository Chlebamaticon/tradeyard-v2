import { Module } from '@nestjs/common';

import { ModeratorModule } from './moderator.module';
import { ModeratorsController } from './moderators.controller';

@Module({
  imports: [ModeratorModule],
  controllers: [ModeratorsController],
})
export class ModeratorsRouteModule {}
