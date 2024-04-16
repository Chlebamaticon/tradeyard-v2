import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateOfferBodyDto,
  GetOfferDto,
  GetOffersDto,
} from '@tradeyard-v2/api-dtos';

import { pagination, PaginationInit } from '..';

import { BaseApiService } from './base-api.service';

@Injectable()
export class OfferApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  create(dto: CreateOfferBodyDto) {
    return this.baseApiService.post('/offers', dto, {});
  }

  one({ offer_id }: { offer_id: string }): Observable<GetOfferDto> {
    return this.baseApiService.get<GetOfferDto>(`/offers/${offer_id}`, {});
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
