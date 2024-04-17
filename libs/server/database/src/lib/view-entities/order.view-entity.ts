import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'order_id')::uuid`, 'order_id')
      .addSelect(
        `("event"."body" ->> 'offer_variant_id')::uuid`,
        'offer_variant_id'
      )
      .addSelect(
        `("event"."body" ->> 'offer_variant_price_id')::uuid`,
        'offer_variant_price_id'
      )
      .addSelect(`("event"."body" ->> 'quantity')`, 'quantity')
      .addSelect(`("event"."body" ->> 'merchant_id')::uuid`, 'merchant_id')
      .addSelect(`("event"."body" ->> 'customer_id')::uuid`, 'customer_id')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'order_id',
          eventTypes: ['order:created', 'order:snapshot'],
        }),
        'event'
      ),
})
export class OrderViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  order_id!: string;

  @ViewColumn()
  offer_variant_id!: string;

  @ViewColumn()
  offer_variant_price_id!: string;

  @ViewColumn()
  quantity!: number;

  @ViewColumn()
  merchant_id!: string;

  @ViewColumn()
  customer_id!: string;

  @ViewColumn()
  created_at!: Date;
}
