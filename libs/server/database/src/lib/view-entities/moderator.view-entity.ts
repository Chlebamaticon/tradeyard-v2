import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'moderator_id')::uuid`, 'moderator_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'moderator_id',
          eventTypes: [
            'moderator:created',
            'moderator:updated',
            'moderator:snapshot',
          ],
        }),
        'event'
      ),
})
export class ModeratorViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  moderator_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  created_at!: Date;
}
