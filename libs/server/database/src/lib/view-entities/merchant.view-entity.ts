import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { UserViewEntity } from './user.view-entity';
import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'merchant_id')::uuid`, 'merchant_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`"user"."email"`, 'email')
      .addSelect(`"user"."first_name"`, 'first_name')
      .addSelect(`"user"."last_name"`, 'last_name')
      .addSelect(`"user"."created_at"`, 'created_at')
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
      )
      .leftJoin(UserViewEntity, 'user', '"user"."user_id" = "user_id"'),
})
export class MerchantViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  merchantId!: string;

  @ViewColumn()
  userId!: string;

  @ViewColumn()
  email!: string;

  @ViewColumn()
  firstName!: string;

  @ViewColumn()
  lastName!: string;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
