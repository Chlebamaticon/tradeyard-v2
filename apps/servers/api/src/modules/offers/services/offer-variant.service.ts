import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { parseUnits } from 'viem';

import {
  CreateOfferVariantBodyDto,
  DeleteOfferVariantPathParamsDto,
  GetOfferVariant,
  GetOfferVariantDto,
  GetOfferVariants,
  GetOfferVariantsDto,
  UpdateOfferVariantBodyDto,
  UpdateOfferVariantPathParamsDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  OfferVariantPriceViewEntity,
  OfferVariantViewEntity,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

import { mapToOfferVariantDto } from '../../../mappers';

@Injectable()
export class OfferVariantService {
  constructor(
    readonly eventRepository: EventRepository,
    @InjectRepository(OfferVariantViewEntity)
    readonly offerVariantRepository: Repository<OfferVariantViewEntity>,
    @InjectRepository(OfferVariantPriceViewEntity)
    readonly offerVariantPriceRepository: Repository<OfferVariantPriceViewEntity>,
    @InjectRepository(TokenViewEntity)
    readonly tokenRepository: Repository<TokenViewEntity>
  ) {}

  async getOne(
    where: FindOptionsWhere<OfferVariantViewEntity>
  ): Promise<GetOfferVariantDto> {
    const variant = await this.offerVariantRepository.findOneOrFail({ where });
    const latestPrice = await this.#latestVariantPrices([
      variant.offer_variant_id,
    ]);

    return GetOfferVariant.parse(mapToOfferVariantDto(variant, latestPrice));
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
    const [items, total] = await this.offerVariantRepository.findAndCount({
      where,
      skip: offset,
      take: limit,
    });
    const latestPrices = await this.#latestVariantPrices(
      items.map((item) => item.offer_variant_id)
    );

    return GetOfferVariants.parse({
      items: items.map((item) => mapToOfferVariantDto(item, latestPrices)),
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
      title: body.title,
      description: body.description,
    });

    return this.offerVariantRepository.findOneOrFail({
      where: { offer_variant_id },
    });
  }

  async updateOne(
    body: Required<UpdateOfferVariantPathParamsDto> & UpdateOfferVariantBodyDto
  ) {
    const variant = await this.offerVariantRepository.findOneByOrFail({
      offer_id: body.offer_id,
      offer_variant_id: body.offer_variant_id,
    });

    if (body.title || body.description) {
      await this.eventRepository.publish('offer:variant:updated', {
        offer_variant_id: body.offer_variant_id,
        title: body.title || variant.title,
        description: body.description || variant.description,
      });
    }

    if (body.price) {
      const token = await this.tokenRepository.findOneByOrFail({
        symbol: body.price.token,
      });
      const price = await this.offerVariantPriceRepository.findOneOrFail({
        where: { offer_variant_id: body.offer_variant_id },
        order: { created_at: 'DESC' },
      });
      await this.eventRepository.publish('offer:variant:price:updated', {
        offer_variant_price_id: price.offer_variant_price_id,
        token_id: token.token_id,
        amount: `${parseUnits(`${body.price.amount}`, token.precision)}`,
      });
    }

    return this.offerVariantRepository.findOneOrFail({
      where: { offer_variant_id: body.offer_variant_id },
    });
  }

  async deleteOne(body: DeleteOfferVariantPathParamsDto) {
    await this.offerVariantRepository.findOneByOrFail({
      offer_id: body.offer_id,
      offer_variant_id: body.offer_variant_id,
    });

    await this.eventRepository.publish('offer:variant:updated', {
      offer_variant_id: body.offer_variant_id,
      archived: true,
    });

    return this.offerVariantRepository.findOneByOrFail({
      offer_id: body.offer_id,
      offer_variant_id: body.offer_variant_id,
    });
  }

  async #latestVariantPrices(
    offerVariantIds: string[]
  ): Promise<
    Record<string, OfferVariantPriceViewEntity & { token: TokenViewEntity }>
  > {
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
