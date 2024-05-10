import {
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { OrderViewEntity } from './order.view-entity';
import { UserViewEntity } from './user.view-entity';

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

  @OneToMany(() => OrderViewEntity, (order) => order.merchant)
  @JoinColumn({ name: 'merchant_id', referencedColumnName: 'merchant_id' })
  orders?: OrderViewEntity[];

  @OneToOne(() => UserViewEntity, (user) => user.merchant)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user?: UserViewEntity;
}
