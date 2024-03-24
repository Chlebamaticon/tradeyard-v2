import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`("event"."body" ->> 'first_name')::varchar`, 'first_name')
      .addSelect(`("event"."body" ->> 'last_name')::varchar`, 'last_name')
      .addSelect(`("event"."body" ->> 'email')::varchar`, 'email')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'user_id',
          eventTypes: ['user:created', 'user:updated', 'user:snapshot'],
        }),
        'event'
      ),
})
export class UserViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  user_id!: string;

  @ViewColumn()
  first_name!: string;

  @ViewColumn()
  last_name!: string;

  @ViewColumn()
  email!: string;

  @ViewColumn()
  created_at!: Date;
}
