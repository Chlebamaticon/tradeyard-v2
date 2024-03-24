import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateMerchant,
  CreateMerchantBody,
  CreateMerchantBodyDto,
  CreateMerchantDto,
  Merchant,
  MerchantDto,
  GetMerchant,
  GetMerchantDto,
  GetMerchantPathParams,
  GetMerchantPathParamsDto,
  GetMerchants,
  GetMerchantsDto,
  GetMerchantsQueryParams,
  GetMerchantsQueryParamsDto,
  UpdateMerchantBody,
  UpdateMerchantBodyDto,
  UpdateMerchantDto,
} from '@tradeyard-v2/api-dtos';
import {
  MerchantViewEntity,
  EventRepository,
} from '@tradeyard-v2/server/database';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class MerchantsService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(MerchantViewEntity)
    readonly merchantRepository: Repository<MerchantViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({
    merchant_id,
  }: GetMerchantPathParamsDto): Promise<GetMerchantDto> {
    const merchant = await this.merchantRepository.findOneOrFail({
      where: {
        merchant_id,
      },
    });

    return GetMerchant.parse(this.mapToMerchantDto(merchant));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetMerchantsQueryParamsDto): Promise<GetMerchantsDto> {
    const [merchants, total] = await this.merchantRepository.findAndCount({
      where: {
        created_at: new Date(timestamp),
      },
      skip: offset,
      take: limit,
    });

    return {
      items: merchants.map((merchant) => this.mapToMerchantDto(merchant)),
      total,
      offset,
      limit,
    };
  }

  async createOne({
    first_name,
    last_name,
    email,
  }: CreateMerchantBodyDto): Promise<CreateMerchantDto> {
    const userCreatedEvent = await this.eventRepository.publish(
      'user:created',
      {
        user_id: randomUUID(),
        first_name,
        last_name,
        email,
      }
    );
    const merchantCreatedEvent = await this.eventRepository.publish(
      'merchant:created',
      {
        merchant_id: randomUUID(),
        user_id: userCreatedEvent.body.user_id,
      }
    );
    const merchant = await this.merchantRepository.findOneOrFail({
      where: { merchant_id: merchantCreatedEvent.body.merchant_id },
    });

    return CreateMerchant.parse(this.mapToMerchantDto(merchant));
  }

  async updateOne(body: UpdateMerchantBodyDto): Promise<UpdateMerchantDto> {
    const merchant = await this.merchantRepository.findOneOrFail({
      where: { merchant_id: body.merchant_id },
    });

    const merchantCreatedEvent = await this.eventRepository.publish(
      'merchant:updated',
      {
        merchant_id: randomUUID(),
      }
    );

    return this.mapToMerchantDto(
      await this.merchantRepository.findOneOrFail({
        where: { merchant_id: merchant.merchant_id },
      })
    );
  }

  mapToMerchantDto(customer: MerchantViewEntity): MerchantDto {
    return Merchant.parse({
      ...customer,
    });
  }
}
