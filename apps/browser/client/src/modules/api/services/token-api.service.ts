import { Injectable } from '@angular/core';

import { GetTokensDto } from '@tradeyard-v2/api-dtos';

import { pagination, PaginationInit } from '..';

import { BaseApiService } from './base-api.service';

@Injectable()
export class TokenApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  // create(dto: CreateTokenBodyDto) {
  //   return this.baseApiService.post('/tokens', dto, {});
  // }

  many({
    initialParams: { offset = 0, limit = 20, timestamp = Date.now() },
    ...notifiers
  }: PaginationInit) {
    return pagination({
      ...notifiers,
      initialParams: { offset, limit },
      initialSearch: { timestamp },
      request: (search, params) =>
        this.baseApiService.get<GetTokensDto>('/tokens', {
          params: { ...search, ...params },
        }),
    });
  }
}
