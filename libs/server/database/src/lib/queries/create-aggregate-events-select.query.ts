import { Brackets, SelectQueryBuilder } from 'typeorm';

import { EventType } from '@tradeyard-v2/server/schemas';

import { EventEntity } from '../entities';

import { escapeArrayToSQL } from './helpers';

export interface CreateAggregateEventsSelectQuery {
  primaryPropertyName: string;
  eventTypes: EventType[];
  alias?: string;
}

export function createAggregateEventsSelectQuery({
  primaryPropertyName,
  eventTypes,
  alias = 'inner_event',
}: CreateAggregateEventsSelectQuery): (
  qb: SelectQueryBuilder<any>
) => SelectQueryBuilder<any> {
  return (queryBuilder: SelectQueryBuilder<any>) =>
    queryBuilder
      .select(
        `("${alias}"."body" ->> '${primaryPropertyName}')::uuid`,
        primaryPropertyName
      )
      .addSelect(`jsonb_recursive_mergeagg("${alias}"."body")`, 'body')
      .addSelect(`MIN("${alias}"."created_at")`, 'created_at')
      .from(
        (qb) =>
          qb
            .select('*')
            .from(EventEntity, 'event')
            .where(
              new Brackets((qb) =>
                qb.where(`"event"."type" IN (${escapeArrayToSQL(eventTypes)})`)
              )
            )
            .orderBy({ id: 'ASC' }),
        alias
      )

      .groupBy(`"${alias}"."body" ->> '${primaryPropertyName}'`);
}
