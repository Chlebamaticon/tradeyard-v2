import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, LessThan, Repository } from 'typeorm';
import { symbol } from 'zod';

import {
  CreateOffer,
  CreateOfferBodyDto,
  CreateOfferDto,
  Offer,
  OfferDto,
  GetOffer,
  GetOfferDto,
  GetOfferPathParamsDto,
  GetOffersDto,
  GetOffersQueryParamsDto,
  UpdateOfferBodyDto,
  UpdateOfferDto,
  OfferVariant,
} from '@tradeyard-v2/api-dtos';
import {
  OfferViewEntity,
  EventRepository,
  OfferVariantViewEntity,
  TokenViewEntity,
  OfferVariantPriceViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class OffersService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(OfferViewEntity)
    readonly offerRepository: Repository<OfferViewEntity>,
    @InjectRepository(TokenViewEntity)
    readonly tokenRepository: Repository<TokenViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({ offer_id }: GetOfferPathParamsDto): Promise<GetOfferDto> {
    const customer = await this.#queryBuilder({
      where: { offer_id },
    }).getOneOrFail();

    return GetOffer.parse(this.mapToOfferDto(customer));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetOffersQueryParamsDto): Promise<GetOffersDto> {
    const [offers, total] = await this.#queryBuilder({
      where: {
        created_at: LessThan(new Date(timestamp)),
      },
    })
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items: offers.map((offer) => this.mapToOfferDto(offer)),
      total,
      offset,
      limit,
      timestamp,
    };
  }

  async createOne({
    title,
    description,
    variants,
  }: CreateOfferBodyDto): Promise<CreateOfferDto> {
    const offerCreatedEvent = await this.eventRepository.publish(
      'offer:created',
      {
        offer_id: randomUUID(),
        title,
        description,
      }
    );

    const offerVariantCreatedEvents = await Promise.all(
      variants.map((variant) =>
        this.eventRepository.publish('offer:variant:created', {
          offer_id: offerCreatedEvent.body.offer_id,
          offer_variant_id: randomUUID(),
          title: variant.title ?? title,
          description: variant.description ?? description,
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
        amount: `${price.amount * token.precision}`,
      });
    });

    const offer = await this.#queryBuilder({
      where: { offer_id: offerCreatedEvent.body.offer_id },
    }).getOneOrFail();

    return CreateOffer.parse(this.mapToOfferDto(offer));
  }

  async updateOne({
    offer_id,
    ...body
  }: UpdateOfferBodyDto): Promise<UpdateOfferDto> {
    const offer = await this.offerRepository.findOneOrFail({
      where: { offer_id },
    });

    await this.eventRepository.publish('offer:updated', {
      offer_id: offer.offer_id,
      ...body,
    });

    return this.mapToOfferDto(
      await this.offerRepository.findOneOrFail({
        where: { offer_id: offer.offer_id },
      })
    );
  }

  mapToOfferDto(
    offer: OfferViewEntity & { variants?: OfferVariantViewEntity[] }
  ): OfferDto {
    return Offer.parse({
      ...offer,
      variants: offer.variants.map((variant) =>
        OfferVariant.parse({
          ...variant,
          current_price: {
            amount: 0,
            token: {
              token_id: randomUUID(),
              symbol: 'MATIC',
              precision: 18,
              name: 'Polygon',
            },
          },
        })
      ),
    });
  }

  #queryBuilder(options: FindManyOptions<OfferViewEntity> = {}) {
    return this.offerRepository
      .createQueryBuilder('offer')
      .setFindOptions(options)
      .leftJoinAndMapMany(
        'offer.variants',
        OfferVariantViewEntity,
        'offer_variant',
        '"offer_variant"."offer_id" = "offer"."offer_id"',
        {}
      );
  }
}
