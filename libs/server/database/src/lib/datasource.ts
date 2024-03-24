import { join } from 'path';

import { config } from 'dotenv';
import 'pg';
import { DataSource } from 'typeorm';

import { createConnectionOptions } from './ormconfig';

console.log(
  config({
    path: join(__dirname, '../../.env'),
  })
);

export default new DataSource(
  createConnectionOptions({
    host: process.env['POSTGRES_HOST'],
    port: Number(process.env['POSTGRES_PORT']),
    username: process.env['POSTGRES_USERNAME'],
    password: process.env['POSTGRES_PASSWORD'],
    database: process.env['POSTGRES_DATABASE'],
  })
);
