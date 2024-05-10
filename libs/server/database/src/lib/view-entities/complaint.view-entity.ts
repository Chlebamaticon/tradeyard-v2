import {
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { ComplaintDecision } from '@tradeyard-v2/server/schemas';

import { createAggregateEventsSelectQuery } from '../queries';

import { ComplaintMessageViewEntity } from './complaint-message.view-entity';
import { OrderViewEntity } from './order.view-entity';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'complaint_id')::uuid`, 'complaint_id')
      .addSelect(`("event"."body" ->> 'order_id')::uuid`, 'order_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`("event"."body" ->> 'decision')::jsonb`, 'decision')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'complaint_id',
          eventTypes: [
            'complaint:created',
            'complaint:decision:refunded',
            'complaint:decision:rejected',
            'complaint:decision:released',
          ],
        }),
        'event'
      ),
})
export class ComplaintViewEntity {
  @PrimaryColumn()
  @ViewColumn()
  complaint_id!: string;

  @ViewColumn()
  order_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  decision!: ComplaintDecision;

  @ViewColumn()
  created_at!: Date;

  @ManyToOne(() => OrderViewEntity, (order) => order.complaints)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'order_id' })
  order?: OrderViewEntity;

  @OneToMany(() => ComplaintMessageViewEntity, (message) => message.complaint)
  @JoinColumn({ name: 'complaint_id', referencedColumnName: 'complaint_id' })
  messages?: ComplaintMessageViewEntity[];
}
