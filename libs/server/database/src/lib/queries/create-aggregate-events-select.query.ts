import { Brackets, SelectQueryBuilder } from 'typeorm';
import { EventEntity } from '../entities';
import { escapeArrayToSQL } from './helpers';
import { EventType } from '../types';

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
        'customer_id'
      )
      .addSelect(`jsonb_recursive_mergeagg("${alias}"."body")`, 'body')
      .from(EventEntity, alias)
      .where(
        new Brackets((qb) =>
          qb.where(`"${alias}"."type" IN (${escapeArrayToSQL(eventTypes)})`)
        )
      )
      .groupBy(`"${alias}"."body" ->> '${primaryPropertyName}'`);
}
