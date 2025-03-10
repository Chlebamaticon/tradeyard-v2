import { Provider } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { SeedToggle } from './seed-toggle.provider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSeed<Type, Args extends any[] = any[]>(
  factory: (source: EntityManager, ...injectables: Args) => Promise<Type>,
  inject?: Args
): [symbol, Provider<Type | null>] {
  const token = Symbol('database:seed');
  return [
    token,
    {
      provide: token,
      useFactory: async (
        isSeedingEnabled: boolean,
        datasource: DataSource,
        ...injectables: Args
      ) =>
        isSeedingEnabled
          ? datasource.transaction((entityManger) =>
              factory(entityManger, ...injectables)
            )
          : null,
      inject: [SeedToggle, DataSource, ...(inject ?? [])],
    },
  ];
}
