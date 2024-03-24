import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixedList } from 'typeorm';

import * as importedEntities from './entities';
import * as importedMigrations from './migrations';
import { createConnectionOptions } from './ormconfig';
import { EventRepository } from './repositories';
import * as importedViewEntities from './view-entities';

// eslint-disable-next-line @typescript-eslint/ban-types
const entities: MixedList<Function> = [];
for (const entity of Object.values(importedEntities)) {
  entities.push(entity);
}
for (const viewEntity of Object.values(importedViewEntities)) {
  entities.push(viewEntity);
}

// eslint-disable-next-line @typescript-eslint/ban-types
const migrations: MixedList<Function> = [];
for (const migration of Object.values(importedMigrations)) {
  migrations.push(migration);
}

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
