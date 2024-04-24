import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'user_wallet_id')::uuid`, 'user_wallet_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`("event"."body" ->> 'chain')::varchar`, 'chain')
      .addSelect(`("event"."body" ->> 'address')::varchar`, 'address')
      .addSelect(`("event"."body" ->> 'type')::varchar`, 'type')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'user_wallet_id',
          eventTypes: ['user:wallet:created'],
        }),
        'event'
      ),
})
export class UserWalletViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  user_wallet_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  type!: string;

  @ViewColumn()
  address!: string;

  @ViewColumn()
  chain!: string;

  @ViewColumn()
  created_at!: Date;
}
