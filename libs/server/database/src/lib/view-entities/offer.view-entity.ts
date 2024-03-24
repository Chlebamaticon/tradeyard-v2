import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'offer_id')::uuid`, 'offer_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`"event"."created_at"`, 'created_at')
      .addSelect(`("event"."body" ->> 'title')`, 'title')
      .addSelect(`("event"."body" ->> 'description')`, 'description')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'offer_id',
          eventTypes: ['offer:created', 'offer:updated', 'offer:snapshot'],
        }),
        'event'
      ),
})
export class OfferViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  offer_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  title!: string;

  @ViewColumn()
  description!: string;

  @ViewColumn()
  created_at!: Date;
}
