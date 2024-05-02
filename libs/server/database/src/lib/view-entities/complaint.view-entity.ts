import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { ComplaintDecision } from '@tradeyard-v2/server/schemas';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'complaint_id')::uuid`, 'complaint_id')
      .addSelect(`("event"."body" ->> 'order_id')::uuid`, 'order_id')
      .addSelect(`("event"."body" ->> 'decision')::jsonb`, 'decision')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'complaint_id',
          eventTypes: [
            'complaint:created',
            'complaint:decision:refunded',
            'complaint:decision:rejected',
            'complaint:decision:released',
          ],
        }),
        'event'
      ),
})
export class ComplaintViewEntity {
  @PrimaryColumn()
  @ViewColumn()
  complaint_id!: string;

  @ViewColumn()
  order_id!: string;

  @ViewColumn()
  decision!: ComplaintDecision;

  @ViewColumn()
  created_at!: Date;
}
