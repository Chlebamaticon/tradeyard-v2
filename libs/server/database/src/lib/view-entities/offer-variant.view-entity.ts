import {
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { OfferVariantPriceViewEntity } from './offer-variant-price.view-entity';
import { OfferViewEntity } from './offer.view-entity';
import { OrderViewEntity } from './order.view-entity';

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
      .addSelect(`("event"."body" ->> 'archived')::bool`, `archived`)
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

  @ViewColumn()
  archived!: boolean | null;

  @ManyToOne(() => OfferViewEntity, (offer) => offer.variants)
  @JoinColumn({ name: 'offer_id', referencedColumnName: 'offer_id' })
  offer?: OfferViewEntity;

  @OneToMany(() => OrderViewEntity, (order) => order.offerVariant)
  @JoinColumn({
    name: 'offer_variant_id',
    referencedColumnName: 'offer_variant_id',
  })
  orders?: OrderViewEntity[];

  @OneToMany(
    () => OfferVariantPriceViewEntity,
    (offerVariantPrice) => offerVariantPrice.offerVariant
  )
  @JoinColumn({
    name: 'offer_variant_id',
    referencedColumnName: 'offer_variant_id',
  })
  offerVariantPrices?: OfferVariantPriceViewEntity[];
}
