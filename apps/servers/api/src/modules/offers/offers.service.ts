import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
} from '@tradeyard-v2/api-dtos';
import {
  OfferViewEntity,
  EventRepository,
} from '@tradeyard-v2/server/database';

@Injectable()
export class OffersService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(OfferViewEntity)
    readonly offerRepository: Repository<OfferViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({ offer_id }: GetOfferPathParamsDto): Promise<GetOfferDto> {
    const customer = await this.offerRepository.findOneOrFail({
      where: {
        offer_id,
      },
    });

    return GetOffer.parse(this.mapToOfferDto(customer));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetOffersQueryParamsDto): Promise<GetOffersDto> {
    const [offers, total] = await this.offerRepository.findAndCount({
      where: {
        created_at: new Date(timestamp),
      },
      skip: offset,
      take: limit,
    });

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
  }: CreateOfferBodyDto): Promise<CreateOfferDto> {
    const offerCreatedEvent = await this.eventRepository.publish(
      'offer:created',
      {
        offer_id: randomUUID(),
        title,
        description,
      }
    );
    const offer = await this.offerRepository.findOneOrFail({
      where: { offer_id: offerCreatedEvent.body.offer_id },
    });

    return CreateOffer.parse(this.mapToOfferDto(offer));
  }

  async updateOne({
    offer_id,
    ...body
  }: UpdateOfferBodyDto): Promise<UpdateOfferDto> {
    const offer = await this.offerRepository.findOneOrFail({
      where: { offer_id },
    });

    const offerUpdatedEvent = await this.eventRepository.publish(
      'offer:updated',
      {
        offer_id: offer.offer_id,
        ...body,
      }
    );

    return this.mapToOfferDto(
      await this.offerRepository.findOneOrFail({
        where: { offer_id: offer.offer_id },
      })
    );
  }

  mapToOfferDto(offer: OfferViewEntity): OfferDto {
    return Offer.parse({
      ...offer,
    });
  }
}
