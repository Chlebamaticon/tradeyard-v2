import { Injectable } from '@angular/core';

import { CreateOfferBodyDto, GetOffersDto } from '@tradeyard-v2/api-dtos';

import { pagination, PaginationInit } from '../api';
import { BaseApiService } from '../api/base-api.service';

@Injectable()
export class OfferApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  create(dto: CreateOfferBodyDto) {
    return this.baseApiService.post('/offers', dto, {});
  }

  many({
    initialParams: { offset = 0, limit = 20, timestamp = Date.now() },
    ...notifiers
  }: PaginationInit) {
    return pagination({
      ...notifiers,
      initialParams: { offset, limit },
      initialSearch: { timestamp },
      request: (search, params) =>
        this.baseApiService.get<GetOffersDto>('/offers', {
          params: { ...search, ...params },
        }),
    });
  }
}
