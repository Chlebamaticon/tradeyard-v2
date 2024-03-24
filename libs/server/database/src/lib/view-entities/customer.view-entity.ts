import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'customer_id')::uuid`, 'customer_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'customer_id',
          eventTypes: [
            'customer:created',
            'customer:updated',
            'customer:snapshot',
          ],
        }),
        'event'
      ),
})
export class CustomerViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  customer_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  created_at!: Date;
}
