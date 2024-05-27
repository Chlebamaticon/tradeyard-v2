import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateMerchant,
  CreateMerchantBodyDto,
  CreateMerchantDto,
  Merchant,
  MerchantDto,
  GetMerchant,
  GetMerchantDto,
  GetMerchantPathParamsDto,
  GetMerchantsDto,
  GetMerchantsQueryParamsDto,
  UpdateMerchantBodyDto,
  UpdateMerchantDto,
} from '@tradeyard-v2/api-dtos';
import {
  MerchantViewEntity,
  EventRepository,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

import { UserService } from '../../users';

@Injectable()
export class MerchantService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(MerchantViewEntity)
    readonly merchantRepository: Repository<MerchantViewEntity>,
    readonly eventRepository: EventRepository,
    readonly userService: UserService
  ) {}

  async getOne({
    merchant_id,
  }: GetMerchantPathParamsDto): Promise<GetMerchantDto> {
    const merchant = await this.merchantRepository.findOneOrFail({
      where: {
        merchant_id,
      },
      relations: { user: true },
    });

    return GetMerchant.parse(this.mapToMerchantDto(merchant));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetMerchantsQueryParamsDto): Promise<GetMerchantsDto> {
    const [merchants, total] = await this.merchantRepository.findAndCount({
      where: { created_at: new Date(timestamp) },
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
    const { user_id } = await this.userService.createOne({
      first_name,
      last_name,
      email,
    });

    const merchantCreatedEvent = await this.eventRepository.publish(
      'merchant:created',
      {
        merchant_id: randomUUID(),
        user_id,
      }
    );

    const merchant = await this.merchantRepository.findOneOrFail({
      where: { merchant_id: merchantCreatedEvent.body.merchant_id },
      relations: { user: true },
    });

    return CreateMerchant.parse(this.mapToMerchantDto(merchant));
  }

  async updateOne(body: UpdateMerchantBodyDto): Promise<UpdateMerchantDto> {
    const merchant = await this.merchantRepository.findOneByOrFail({
      merchant_id: body.merchant_id,
    });

    await this.eventRepository.publish('merchant:updated', {
      merchant_id: merchant.merchant_id,
    });

    return this.mapToMerchantDto(
      await this.merchantRepository.findOneOrFail({
        where: { merchant_id: merchant.merchant_id },
      })
    );
  }

  mapToMerchantDto({
    user,
    ...customer
  }: MerchantViewEntity & { user?: UserViewEntity }): MerchantDto {
    return Merchant.parse({
      ...customer,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
    });
  }
}
