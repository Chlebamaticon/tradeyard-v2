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
      .addSelect(
        `("event"."body" ->> 'created_at')::timestamp with time zone`,
        'created_at'
      )
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
  userId!: string;

  @ViewColumn()
  firstName!: string;

  @ViewColumn()
  lastName!: string;

  @ViewColumn()
  email!: string;
}
