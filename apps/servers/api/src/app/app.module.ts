import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ServerDatabaseModule } from '@tradeyard-v2/server/database';

@Module({
  imports: [ServerDatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
