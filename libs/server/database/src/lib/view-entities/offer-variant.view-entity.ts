import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'offer_id')::uuid`, `offer_id`)
      .addSelect(
        `("event"."body" ->> 'offer_variant_id')::uuid`,
        `offer_variant_id`
      )
      .addSelect(`"event"."body" ->> 'title'`, `title`)
      .addSelect(`"event"."body" ->> 'description'`, `description`)
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'offer_variant_id',
          eventTypes: [
            'offer:variant:created',
            'offer:variant:updated',
            'offer:variant:snapshot',
          ],
        }),
        'event'
      ),
})
export class OfferVariantViewEntity {
  @PrimaryColumn()
  @ViewColumn()
  offer_variant_id!: string;

  @ViewColumn()
  offer_id!: string;

  @ViewColumn()
  title!: string;

  @ViewColumn()
  description!: string;

  @ViewColumn()
  created_at!: Date;
}
