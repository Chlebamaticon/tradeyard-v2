import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { createAggregateEventsSelectQuery } from '../queries';

import { ContractDeploymentViewEntity } from './contract-deployment.view-entity';
import { OrderViewEntity } from './order.view-entity';

@ViewEntity({
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select(`("event"."body" ->> 'contract_id')::uuid`, 'contract_id')
      .addSelect(`"contract_deployment"."address"`, 'contract_address')
      .addSelect(
        `"contract_deployment"."transaction_hash"`,
        'deployment_transaction_hash'
      )
      .addSelect(`"contract_deployment"."created_at"`, 'deployed_at')
      .addSelect(`"event"."created_at"`, 'created_at')
      .from(
        createAggregateEventsSelectQuery({
          primaryPropertyName: 'contract_id',
          eventTypes: ['contract:created'],
        }),
        'event'
      )
      .leftJoin(
        (qb) =>
          qb
            .from(ContractDeploymentViewEntity, 'deployment')
            .orderBy('"deployment"."created_at"', 'DESC')
            .take(1),
        'contract_deployment',
        `"contract_deployment"."contract_id" = ("event"."body" ->> 'contract_id')::uuid`
      ),
})
export class ContractViewEntity {
  @ViewColumn()
  @PrimaryColumn()
  contract_id!: string;

  @ViewColumn()
  contract_address!: string;

  @ViewColumn()
  deployment_transaction_hash!: string;

  @ViewColumn()
  deployed_at!: Date;

  @ViewColumn()
  created_at!: Date;
}
