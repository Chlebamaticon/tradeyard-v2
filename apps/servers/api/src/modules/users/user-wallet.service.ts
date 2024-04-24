import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import {
  CreateUserWalletBodyDto,
  CreateUserWalletDto,
  GetUserWalletsDto,
  GetUserWalletsQueryParamsDto,
  UserWalletDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  UserWalletViewEntity,
} from '@tradeyard-v2/server/database';
import { UserWallet } from '@tradeyard-v2/server/schemas';

@Injectable()
export class UserWalletService {
  constructor(
    @InjectRepository(UserWalletViewEntity)
    readonly userWalletRepository: Repository<UserWalletViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

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
      total,
    };
  }

  async createOne(
    body: CreateUserWalletBodyDto & { user_id: string }
  ): Promise<CreateUserWalletDto> {
    const wallet = await this.eventRepository.publish('user:wallet:created', {
      user_wallet_id: randomUUID(),
      ...body,
    });
    return UserWallet.parse(wallet);
  }

  mapToUserWalletDto(wallet: UserWalletViewEntity): UserWalletDto {
    return UserWallet.parse({
      ...wallet,
    });
  }
}
