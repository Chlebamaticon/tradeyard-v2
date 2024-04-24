import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'contract_id')::uuid`, 'contract_id')
      .addSelect(
        `("event"."body" ->> 'deployment')::jsonb ->> 'transaction_hash'`,
        'transaction_hash'
      )
      .addSelect(
        `("event"."body" ->> 'deployment')::jsonb ->> 'error'`,
        'error_message'
      )
      .addSelect(
        `("event"."body" ->> 'deployment')::jsonb ->> 'address'`,
        'address'
      )
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'transaction_hash',
          eventTypes: [
            'contract:deployment:started',
            'contract:deployment:failed',
            'contract:deployment:completed',
          ],
        }),
        'event'
      ),
})
export class ContractDeploymentViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  transaction_hash!: string;

  @ViewColumn()
  contract_id!: string;

  @ViewColumn()
  address!: string;

  @ViewColumn()
  error_message!: string;

  @ViewColumn()
  created_at!: Date;
}
