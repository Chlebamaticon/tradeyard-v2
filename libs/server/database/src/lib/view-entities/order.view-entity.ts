import {
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { ComplaintViewEntity } from './complaint.view-entity';
import { ContractViewEntity } from './contract.view-entity';
import { CustomerViewEntity } from './customer.view-entity';
import { MerchantViewEntity } from './merchant.view-entity';
import { OfferVariantViewEntity } from './offer-variant.view-entity';

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
      .addSelect(`("event"."body" ->> 'contract_id')::uuid`, 'contract_id')
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
  contract_id!: string;

  @ViewColumn()
  created_at!: Date;

  @OneToMany(() => ComplaintViewEntity, (complaint) => complaint.order)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'order_id' })
  complaints?: ComplaintViewEntity[];

  @ManyToOne(() => CustomerViewEntity, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
  customer?: CustomerViewEntity;

  @ManyToOne(() => MerchantViewEntity, (merchant) => merchant.orders)
  @JoinColumn({ name: 'merchant_id', referencedColumnName: 'merchant_id' })
  merchant?: MerchantViewEntity;

  @OneToOne(() => ContractViewEntity, (contract) => contract.order)
  @JoinColumn({ name: 'contract_id', referencedColumnName: 'contract_id' })
  contract?: ContractViewEntity;

  @ManyToOne(
    () => OfferVariantViewEntity,
    (offerVariant) => offerVariant.orders
  )
  @JoinColumn({
    name: 'offer_variant_id',
    referencedColumnName: 'offer_variant_id',
  })
  offerVariant?: OfferVariantViewEntity;
}
