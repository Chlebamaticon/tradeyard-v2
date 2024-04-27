import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import {
  CreateUserWalletBodyDto,
  CreateUserWalletDto,
  GetUserWalletDto,
  GetUserWalletsDto,
  GetUserWalletsQueryParamsDto,
  UserWallet,
  UserWalletDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  UserWalletViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class UserWalletService {
  constructor(
    @InjectRepository(UserWalletViewEntity)
    readonly userWalletRepository: Repository<UserWalletViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne(
    params:
      | {
          user_id: string;
          type: 'turnkey' | 'custodial';
          user_wallet_id?: never;
          address?: never;
        }
      | {
          user_wallet_id: string;
          user_id?: string;
          type?: 'turnkey' | 'custodial';
          address?: never;
        }
      | {
          address: string;
          user_id?: string;
          type?: 'turnkey' | 'custodial';
          user_wallet_id?: never;
        }
  ): Promise<GetUserWalletDto> {
    return this.mapToUserWalletDto(
      await this.userWalletRepository.findOneByOrFail(params)
    );
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
    user_id,
  }: GetUserWalletsQueryParamsDto & {
    user_id: string;
  }): Promise<GetUserWalletsDto> {
    const [wallets, total] = await this.userWalletRepository.findAndCount({
      where: {
        user_id,
        created_at: LessThanOrEqual(new Date(timestamp)),
      },
      skip: offset,
      take: limit,
    });

    return {
      items: wallets.map((wallet) => this.mapToUserWalletDto(wallet)),
      offset,
      limit,
      total,
    };
  }

  async createOne(
    body: CreateUserWalletBodyDto & { user_id: string }
  ): Promise<CreateUserWalletDto> {
    const event = await this.eventRepository.publish('user:wallet:created', {
      user_wallet_id: randomUUID(),
      ...body,
    });
    return UserWallet.parse(
      await this.userWalletRepository.findOneByOrFail({
        user_wallet_id: event.body.user_wallet_id,
      })
    );
  }

  mapToUserWalletDto(wallet: UserWalletViewEntity): UserWalletDto {
    return UserWallet.parse({
      ...wallet,
      created_at: `${wallet.created_at.toUTCString()}`,
    });
  }
}
