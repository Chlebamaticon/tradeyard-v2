import { PrimaryColumn, View, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(
        `("event"."body" ->> 'user_credential_id')::uuid`,
        'user_credential_id'
      )
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`("event"."body" ->> 'type')::varchar`, 'type')
      .addSelect(`("event"."body" ->> 'hash')::varchar`, 'hash')
      .addSelect(`("event"."body" ->> 'salt')::varchar`, 'salt')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'user_credential_id',
          eventTypes: ['user:credential:created', 'user:credential:snapshot'],
        }),
        'event'
      ),
})
export class UserCredentialViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  user_credential_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  type!: string;

  @ViewColumn()
  salt!: string;

  @ViewColumn()
  hash!: string;

  @ViewColumn()
  created_at!: Date;
}
