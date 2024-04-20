import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import {
  CreateOfferVariantBodyDto,
  GetOfferVariant,
  GetOfferVariantDto,
  GetOfferVariants,
  GetOfferVariantsDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  OfferVariantPriceViewEntity,
  OfferVariantViewEntity,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class OfferVariantService {
  constructor(
    readonly eventRepository: EventRepository,
    @InjectRepository(OfferVariantViewEntity)
    readonly offerVariantRepository: Repository<OfferVariantViewEntity>,
    @InjectRepository(OfferVariantPriceViewEntity)
    readonly offerVariantPriceRepository: Repository<OfferVariantPriceViewEntity>
  ) {}

  async getOne(
    where: FindOptionsWhere<OfferVariantViewEntity>
  ): Promise<GetOfferVariantDto> {
    const variant = await this.queryBuilder({ where }).getOneOrFail();
    const latestPrice = await this.#latestVariantPrices([
      variant.offer_variant_id,
    ]);

    return GetOfferVariant.parse({
      ...variant,
      current_price: latestPrice[variant.offer_variant_id],
    });
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
    const offer_variant_id = randomUUID();
    this.eventRepository.publish('offer:variant:created', {
      offer_id: body.offer_id,
      offer_variant_id,
    });

    return this.offerVariantRepository.findOneOrFail({
      where: { offer_variant_id },
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
      .setFindOptions({ where, skip: offset, take: limit });
    if (offset !== undefined) qb.skip(offset);
    if (limit !== undefined) qb.take(limit);
    return qb;
  }

  async #latestVariantPrices(offerVariantIds: string[]) {
    const variantPrices = await this.offerVariantPriceRepository
      .createQueryBuilder('offer_variant_price')
      .innerJoin(
        (qb) =>
          qb
            .distinct(true)
            .select('"variant_price"."offer_variant_id"', 'offer_variant_id')
            .addSelect('MAX("variant_price"."created_at")', 'created_at')
            .from(OfferVariantPriceViewEntity, 'variant_price')
            .where('"variant_price"."offer_variant_id" IN (:...ids)', {
              ids: offerVariantIds,
            })
            .groupBy('"variant_price"."offer_variant_id"'),
        'latest_variant_price',
        '"latest_variant_price"."offer_variant_id" = "offer_variant_price"."offer_variant_id"'
      )
      .leftJoinAndMapOne(
        'offer_variant_price.token',
        TokenViewEntity,
        'token',
        '"offer_variant_price"."token_id" = "token"."token_id"'
      )
      .getMany();

    return variantPrices.reduce(
      (acc, variantPrice) => ({
        ...acc,
        [variantPrice.offer_variant_id]: variantPrice,
      }),
      {}
    );
  }
}
