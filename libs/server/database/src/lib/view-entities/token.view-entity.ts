import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'token_id')::uuid`, 'token_id')
      .addSelect(`("event"."body" ->> 'token_address')::varchar`, 'token_id')
      .addSelect(`("event"."body" ->> 'symbol')::varchar`, 'symbol')
      .addSelect(`("event"."body" ->> 'precision')::int`, 'precision')
      .addSelect(`("event"."body" ->> 'name')::varchar`, 'name')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'token_id',
          eventTypes: ['token:created', 'token:updated', 'token:snapshot'],
        }),
        'event'
      ),
})
export class TokenViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  token_id!: string;

  @ViewColumn()
  token_address!: string;

  @ViewColumn()
  symbol!: string;

  @ViewColumn()
  name!: string;

  @ViewColumn()
  precision!: number;

  @ViewColumn()
  created_at!: Date;
}
