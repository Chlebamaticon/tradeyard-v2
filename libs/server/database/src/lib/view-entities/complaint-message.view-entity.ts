import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(
        `("event"."body" ->> 'complaint_message_id')::uuid`,
        'complaint_message_id'
      )
      .addSelect(`("event"."body" ->> 'complaint_id')::uuid`, 'complaint_id')
      .addSelect(`("event"."body" ->> 'user_id')::uuid`, 'user_id')
      .addSelect(`("event"."body" ->> 'sent_at')::timestamp`, 'sent_at')
      .addSelect(`("event"."body" ->> 'markdown')`, 'markdown')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'complaint_message_id',
          eventTypes: ['complaint:message:created'],
        }),
        'event'
      ),
})
export class ComplaintMessageViewEntity {
  @PrimaryColumn()
  @ViewColumn()
  complaint_message_id!: string;

  @ViewColumn()
  complaint_id!: string;

  @ViewColumn()
  user_id!: string;

  @ViewColumn()
  markdown!: string;

  @ViewColumn()
  sent_at!: Date;

  @ViewColumn()
  created_at!: Date;
}
