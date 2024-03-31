import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'merchant_id')::uuid`, 'merchant_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'merchant_id',
          eventTypes: [
            'merchant:created',
            'merchant:updated',
            'merchant:snapshot',
          ],
        }),
        'event'
      ),
})
export class MerchantViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  merchant_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  created_at!: Date;
}
