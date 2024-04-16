import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  In,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
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
  OfferVariantPrice,
  OfferVariantPriceDto,
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
    @InjectRepository(OfferVariantPriceViewEntity)
    readonly offerVariantPriceRepository: Repository<OfferVariantPriceViewEntity>,
    @InjectRepository(TokenViewEntity)
    readonly tokenRepository: Repository<TokenViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({ offer_id }: GetOfferPathParamsDto): Promise<GetOfferDto> {
    const offer = await this.#queryBuilder({
      where: { offer_id },
    }).getOneOrFail();

    const latestVariantPrices = await this.#latestVariantPrices(
      offer.variants ?? []
    );

    return GetOffer.parse(this.mapToOfferDto(offer, { latestVariantPrices }));
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

    const variants = offers.map(({ variants }) => variants).flat();
    const latestVariantPrices = await this.#latestVariantPrices(variants);

    return {
      items: offers.map((offer) =>
        this.mapToOfferDto(offer, { latestVariantPrices })
      ),
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

      const base = 10n ** BigInt(token.precision);
      return await this.eventRepository.publish('offer:variant:price:created', {
        offer_variant_price_id: randomUUID(),
        offer_variant_id: body.offer_variant_id,
        token_id: token.token_id,
        amount: `${BigInt(price.amount) * base}`,
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
    offer: OfferViewEntity & { variants?: OfferVariantViewEntity[] },
    enhancements: {
      latestVariantPrices?: Record<
        string,
        OfferVariantPriceViewEntity & { token: TokenViewEntity }
      >;
    } = {}
  ): OfferDto {
    const { latestVariantPrices = {} } = enhancements;
    return Offer.parse({
      ...offer,
      variants: offer.variants.map((variant) =>
        OfferVariant.parse({
          ...variant,
          current_price: this.mapToOfferPriceDto(
            latestVariantPrices[variant.offer_variant_id]
          ),
        })
      ),
    });
  }

  mapToOfferPriceDto(
    price: OfferVariantPriceViewEntity & { token: TokenViewEntity }
  ): OfferVariantPriceDto {
    const base = 10n ** BigInt(price.token.precision);
    return OfferVariantPrice.parse({
      amount: +`${BigInt(price.amount) / base}`,
      token: price.token,
    });
  }

  #queryBuilder(
    options: FindManyOptions<OfferViewEntity> = {}
  ): SelectQueryBuilder<
    OfferViewEntity & { variants: OfferVariantViewEntity[] }
  > {
    const { manager } = this.offerRepository;
    return manager
      .createQueryBuilder<
        OfferViewEntity & { variants: OfferVariantViewEntity[] }
      >(OfferViewEntity, 'offer')
      .setFindOptions(options)
      .leftJoinAndMapMany(
        'offer.variants',
        OfferVariantViewEntity,
        'offer_variant',
        '"offer_variant"."offer_id" = "offer"."offer_id"',
        {}
      );
  }

  async #latestVariantPrices(
    variants: OfferVariantViewEntity[]
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
