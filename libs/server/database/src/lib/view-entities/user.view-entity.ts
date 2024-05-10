import {
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { CustomerViewEntity } from './customer.view-entity';
import { MerchantViewEntity } from './merchant.view-entity';
import { ModeratorViewEntity } from './moderator.view-entity';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`("event"."body" ->> 'first_name')::varchar`, 'first_name')
      .addSelect(`("event"."body" ->> 'last_name')::varchar`, 'last_name')
      .addSelect(`("event"."body" ->> 'email')::varchar`, 'email')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'user_id',
          eventTypes: ['user:created', 'user:updated', 'user:snapshot'],
        }),
        'event'
      ),
})
export class UserViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  user_id!: string;

  @ViewColumn()
  first_name!: string;

  @ViewColumn()
  last_name!: string;

  @ViewColumn()
  email!: string;

  @ViewColumn()
  created_at!: Date;

  @OneToOne(() => CustomerViewEntity, (customer) => customer.user)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  customer?: CustomerViewEntity;

  @OneToOne(() => MerchantViewEntity, (merchant) => merchant.user)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  merchant?: MerchantViewEntity;

  @OneToOne(() => ModeratorViewEntity, (moderator) => moderator.user)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  moderator?: ModeratorViewEntity;
}
