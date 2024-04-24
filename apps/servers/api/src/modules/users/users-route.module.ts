import { Module } from '@nestjs/common';

import { UsersController } from './user.controller';
import { UserModule } from './user.module';

@Module({
  imports: [UserModule],
  controllers: [UsersController],
})
export class UsersRouteModule {}
