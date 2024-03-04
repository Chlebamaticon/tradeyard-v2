import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixedList } from 'typeorm';

import * as importedEntities from './entities';
import * as importedMigrations from './migrations';
import * as importedViewEntities from './view-entities';
import { SnakeNamingStrategy } from './snake-naming.strategy';
import { EventRepository } from './repositories';

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

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        logging: true,
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'root',
        password: 'root',
        database: 'tradeyard',
        entities,
        migrations,
        migrationsTransactionMode: 'each',
        synchronize: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
  providers: [EventRepository],
  exports: [TypeOrmModule, EventRepository],
})
export class ServerDatabaseModule {}
