import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';

import {
  GetTokenDto,
  GetTokensDto,
  GetTokensQueryParamsDto,
  Token,
  TokenDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class TokenService {
  constructor(
    readonly eventRepository: EventRepository,
    @InjectRepository(TokenViewEntity)
    readonly tokenRepository: Repository<TokenViewEntity>
  ) {}

  async getOne(where: FindOptionsWhere<TokenViewEntity>): Promise<GetTokenDto> {
    return this.mapToTokenDto(
      await this.tokenRepository.findOneOrFail({ where })
    );
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetTokensQueryParamsDto): Promise<GetTokensDto> {
    const [offers, total] = await this.tokenRepository.findAndCount({
      where: {
        created_at: LessThan(new Date(timestamp)),
      },
      skip: offset,
      take: limit,
    });

    return {
      items: offers.map((offer) => this.mapToTokenDto(offer)),
      total,
      offset,
      limit,
      timestamp,
    };
  }

  mapToTokenDto(token: TokenViewEntity): TokenDto {
    return Token.parse({
      ...token,
    });
  }
}
