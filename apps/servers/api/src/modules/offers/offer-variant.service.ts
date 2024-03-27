import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import {
  CreateOfferVariantBodyDto,
  GetOfferVariantDto,
  GetOfferVariants,
  GetOfferVariantsDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  OfferVariantPriceViewEntity,
  OfferVariantViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class OfferVariantService {
  constructor(
    readonly eventRepository: EventRepository,
    @InjectRepository(OfferVariantViewEntity)
    readonly offerVariantRepository: Repository<OfferVariantViewEntity>
  ) {}

  async getOne(
    where: FindOptionsWhere<OfferVariantViewEntity>
  ): Promise<GetOfferVariantDto> {
    return this.queryBuilder({ where }).getOneOrFail();
  }

  async getMany({
    where,
    offset = 0,
    limit = 20,
  }: {
    where?: FindOptionsWhere<OfferVariantViewEntity>;
    offset?: number;
    limit?: number;
  }): Promise<GetOfferVariantsDto> {
    const [items, total] = await this.queryBuilder({
      where,
      offset,
      limit,
    }).getManyAndCount();

    return GetOfferVariants.parse({
      items,
      total,
      offset,
      limit,
    });
  }

  async create(body: CreateOfferVariantBodyDto) {
    this.eventRepository.publish('offer:variant:created', {
      offer_id: body.offer_id,
      offer_variant_id: randomUUID(),
    });
  }

  queryBuilder({
    where,
    offset,
    limit,
  }: {
    where?: FindOptionsWhere<OfferVariantViewEntity>;
    offset?: number;
    limit?: number;
  }) {
    const qb = this.offerVariantRepository
      .createQueryBuilder('offer_variant')
      .setFindOptions({ where, skip: offset, take: limit })
      .leftJoinAndMapOne(
        'offer_variant.current_price',
        (qb) =>
          qb
            .from(OfferVariantPriceViewEntity, 'offer_variant_price')
            .orderBy('created_at', 'DESC'),
        'offer_variant_price',
        '"offer_variant_price"."offer_variant_id" = "offer_variant"."offer_variant_id"'
      );
    if (offset !== undefined) qb.skip(offset);
    if (limit !== undefined) qb.take(limit);
    return qb;
  }
}
