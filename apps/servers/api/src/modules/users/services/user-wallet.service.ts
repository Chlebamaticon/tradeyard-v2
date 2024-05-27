import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as tk from '@turnkey/sdk-server';
import { LessThanOrEqual, Repository } from 'typeorm';

import {
  CreateTurnkeyWalletBodyDto,
  CreateUserWalletBodyDto,
  CreateUserWalletDto,
  currentChain,
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

import { TurnkeyApiClient } from '../../turnkey';
@Injectable()
export class UserWalletService {
  constructor(
    @Inject(TurnkeyApiClient)
    readonly turnkeyApiClient: tk.TurnkeyApiClient,
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

  async createTurnkeyWallet(
    body: CreateTurnkeyWalletBodyDto & { user_id: string; email: string }
  ): Promise<CreateUserWalletDto> {
    const { subOrganizationId, wallet } =
      await this.turnkeyApiClient.createSubOrganization({
        subOrganizationName: body.email,
        rootQuorumThreshold: 1,
        rootUsers: [
          {
            userName: body.email,
            userEmail: body.email,
            apiKeys: [],
            authenticators: [
              {
                authenticatorName: 'passkey',
                challenge: body.challenge,
                attestation: {
                  credentialId: body.attestation.credentialId,
                  clientDataJson: body.attestation.clientDataJson,
                  attestationObject: body.attestation.attestationObject,
                  transports: body.attestation.transports,
                },
              },
            ],
          },
        ],
        wallet: {
          walletName: 'Default Wallet',
          accounts: tk.DEFAULT_ETHEREUM_ACCOUNTS,
        },
      });
    const [address] = wallet!.addresses;
    const event = await this.eventRepository.publish('user:wallet:created', {
      user_id: body.user_id,
      user_wallet_id: randomUUID(),
      chain: `${currentChain.id}`,
      type: 'turnkey',
      address,
      sub_organization_id: subOrganizationId,
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
