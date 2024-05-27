import { Module } from '@nestjs/common';

import { ModeratorsController } from './controllers';
import { ModeratorModule } from './moderator.module';

@Module({
  imports: [ModeratorModule],
  controllers: [ModeratorsController],
})
export class ModeratorsRouteModule {}
