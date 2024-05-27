import 'dotenv/config';
import 'pg';

import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import * as importedEntities from './entities';
import * as importedMigrations from './migrations';
import { SnakeNamingStrategy } from './snake-naming.strategy';
import * as importedViewEntities from './view-entities';

export interface ConnectionCredentials {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

const connectionOptions: PostgresConnectionOptions = {
  type: 'postgres',
  logging: false, // Set true to log raw SQL queries
  migrationsRun: true,
  synchronize: false,
};

export const createConnectionOptions = (
  credentials: PostgresConnectionCredentialsOptions
): PostgresConnectionOptions => {
  const migrations: PostgresConnectionOptions['migrations'] = [];
  for (const migration of Object.values(importedMigrations)) {
    if (typeof migration !== 'function') {
      throw new Error(`Expected migration to be a class, or function`);
    }
    migrations.push(migration);
  }

  const entities: PostgresConnectionOptions['entities'] = [];
  for (const entity of Object.values(importedEntities)) {
    entities.push(entity);
  }

  for (const viewEntity of Object.values(importedViewEntities)) {
    entities.push(viewEntity);
  }
  return {
    ...connectionOptions,
    migrations,
    entities,
    host: credentials.host,
    port: credentials.port,
    username: credentials.username,
    password: credentials.password,
    database: credentials.database,
    ssl: credentials.ssl,
    namingStrategy: new SnakeNamingStrategy(),
  };
};
