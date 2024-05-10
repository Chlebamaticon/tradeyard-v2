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
      .select(`("event"."body" ->> 'customer_id')::uuid`, 'customer_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'customer_id',
          eventTypes: [
            'customer:created',
            'customer:updated',
            'customer:snapshot',
          ],
        }),
        'event'
      ),
})
export class CustomerViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  customer_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  created_at!: Date;

  @OneToMany(() => OrderViewEntity, (order) => order.customer)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
  orders?: OrderViewEntity[];

  @OneToOne(() => UserViewEntity, (user) => user.customer)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user?: UserViewEntity;
}
