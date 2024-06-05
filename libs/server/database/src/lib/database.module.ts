import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createConnectionOptions } from './ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () =>
        createConnectionOptions({
          host: 'localhost',
          port: 5432,
          username: 'root',
          password: 'root',
          database: 'tradeyard',
        }),
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
