import {
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { OfferVariantViewEntity } from './offer-variant.view-entity';
import { TokenViewEntity } from './token.view-entity';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(
        `("event"."body" ->> 'offer_variant_id')::uuid`,
        `offer_variant_id`
      )
      .addSelect(
        `("event"."body" ->> 'offer_variant_price_id')::uuid`,
        `offer_variant_price_id`
      )
      .addSelect(`("event"."body" ->> 'token_id')::uuid`, 'token_id')
      .addSelect(`"event"."body" ->> 'amount'`, `amount`)
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'offer_variant_price_id',
          eventTypes: [
            'offer:variant:price:created',
            'offer:variant:price:updated',
            'offer:variant:price:snapshot',
          ],
        }),
        'event'
      ),
})
export class OfferVariantPriceViewEntity {
  @PrimaryColumn()
  @ViewColumn()
  offer_variant_price_id!: string;

  @ViewColumn()
  offer_variant_id!: string;

  @ViewColumn()
  token_id!: string;

  @ViewColumn()
  amount!: string;

  @ViewColumn()
  created_at!: Date;

  @ManyToOne(
    () => OfferVariantViewEntity,
    (offer_variant) => offer_variant.offerVariantPrices
  )
  @JoinColumn({
    name: 'offer_variant_id',
    referencedColumnName: 'offer_variant_id',
  })
  offerVariant?: OfferVariantViewEntity;

  @ManyToOne(() => TokenViewEntity, (token) => token.offerVariantPrices)
  @JoinColumn({ name: 'token_id', referencedColumnName: 'token_id' })
  token?: TokenViewEntity;
}
