import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Or, Repository } from 'typeorm';
import { parseUnits } from 'viem';

import {
  CreateOffer,
  CreateOfferBodyDto,
  CreateOfferDto,
  GetOffer,
  GetOfferDto,
  GetOfferPathParamsDto,
  GetOffersDto,
  GetOffersQueryParamsDto,
  UpdateOfferBodyDto,
  UpdateOfferDto,
} from '@tradeyard-v2/api-dtos';
import {
  OfferViewEntity,
  EventRepository,
  OfferVariantViewEntity,
  TokenViewEntity,
  OfferVariantPriceViewEntity,
} from '@tradeyard-v2/server/database';

import { mapToOfferDto } from '../../../mappers';

@Injectable()
export class OfferService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(OfferViewEntity)
    readonly offerRepository: Repository<OfferViewEntity>,
    @InjectRepository(OfferVariantPriceViewEntity)
    readonly offerVariantPriceRepository: Repository<OfferVariantPriceViewEntity>,
    @InjectRepository(TokenViewEntity)
    readonly tokenRepository: Repository<TokenViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({ offer_id }: GetOfferPathParamsDto): Promise<GetOfferDto> {
    const offer = await this.offerRepository.findOneOrFail({
      where: { offer_id, variants: { archived: Or(Not(true), IsNull()) } },
      relations: {
        variants: true,
      },
    });

    const latestVariantPrices = await this.#latestVariantPrices(
      offer.variants ?? []
    );

    return GetOffer.parse(mapToOfferDto(offer, { latestVariantPrices }));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetOffersQueryParamsDto): Promise<GetOffersDto> {
    const [offers, total] = await this.offerRepository.findAndCount({
      where: {
        created_at: LessThan(new Date(timestamp)),
        variants: { archived: Or(Not(true), IsNull()) },
      },
      relations: {
        variants: true,
      },
      skip: offset,
      take: limit,
    });

    const variants = offers.reduce(
      (acc: OfferVariantViewEntity[], { variants }) =>
        variants ? [...acc, ...variants] : acc,
      []
    );
    const latestVariantPrices = await this.#latestVariantPrices(variants);

    return {
      items: offers.map((offer) =>
        mapToOfferDto(offer, { latestVariantPrices })
      ),
      total,
      offset,
      limit,
      timestamp,
    };
  }

  async createOne({
    variants,
    ...body
  }: CreateOfferBodyDto & { merchant_id: string }): Promise<CreateOfferDto> {
    const offerCreatedEvent = await this.eventRepository.publish(
      'offer:created',
      {
        offer_id: randomUUID(),
        ...body,
      }
    );

    const offerVariantCreatedEvents = await Promise.all(
      variants.map((variant) =>
        this.eventRepository.publish('offer:variant:created', {
          offer_id: offerCreatedEvent.body.offer_id,
          offer_variant_id: randomUUID(),
          title: variant.title ?? body.title,
          description: variant.description ?? body.description,
        })
      )
    );

    await offerVariantCreatedEvents.map(async ({ body }, index) => {
      const { price } = variants[index];

      const token = await this.tokenRepository.findOneOrFail({
        where: { symbol: price.token },
      });

      return await this.eventRepository.publish('offer:variant:price:created', {
        offer_variant_price_id: randomUUID(),
        offer_variant_id: body.offer_variant_id,
        token_id: token.token_id,
        amount: `${parseUnits(`${price.amount}`, token.precision)}`,
      });
    });

    const offer = await this.offerRepository.findOneOrFail({
      where: { offer_id: offerCreatedEvent.body.offer_id },
    });

    return CreateOffer.parse(mapToOfferDto(offer));
  }

  async updateOne({
    offer_id,
    merchant_id,
    ...body
  }: UpdateOfferBodyDto & { merchant_id: string }): Promise<UpdateOfferDto> {
    const offer = await this.offerRepository.findOneOrFail({
      where: { offer_id, merchant_id },
    });

    await this.eventRepository.publish('offer:updated', {
      offer_id: offer.offer_id,
      title: body.title,
      description: body.description,
    });

    return mapToOfferDto(
      await this.offerRepository.findOneOrFail({
        where: { offer_id: offer.offer_id },
      })
    );
  }

  async #latestVariantPrices(
    variants: OfferVariantViewEntity[]
  ): Promise<
    Record<string, OfferVariantPriceViewEntity & { token: TokenViewEntity }>
  > {
    if (!variants.length) return {};
    const variantPrices = await this.offerVariantPriceRepository
      .createQueryBuilder('offer_variant_price')
      .innerJoin(
        (qb) =>
          qb
            .distinctOn(['offer_variant_id'])
            .select('"variant_price"."offer_variant_id"', 'offer_variant_id')
            .addSelect('MAX("variant_price"."created_at")', 'created_at')
            .from(OfferVariantPriceViewEntity, 'variant_price')
            .where('"variant_price"."offer_variant_id" IN (:...ids)', {
              ids: variants.map((variant) => variant.offer_variant_id),
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
