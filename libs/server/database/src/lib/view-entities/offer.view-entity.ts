import {
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { OfferVariantViewEntity } from './offer-variant.view-entity';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'offer_id')::uuid`, 'offer_id')
      .addSelect(`("event"."body" ->> 'title')`, 'title')
      .addSelect(`("event"."body" ->> 'description')`, 'description')
      .addSelect(`("event"."body" ->> 'merchant_id')::uuid`, 'merchant_id')
      .addSelect(`"event"."created_at"`, 'created_at')
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
  merchant_id!: string;

  @ViewColumn()
  title!: string;

  @ViewColumn()
  description!: string;

  @ViewColumn()
  created_at!: Date;

  @OneToMany(() => OfferVariantViewEntity, (offerVariant) => offerVariant.offer)
  @JoinColumn({ name: 'offer_id', referencedColumnName: 'offer_id' })
  variants?: OfferVariantViewEntity[];
}
