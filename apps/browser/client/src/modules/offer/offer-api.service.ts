import { Injectable } from '@angular/core';

import { CreateOfferBodyDto } from '@tradeyard-v2/api-dtos';

import { BaseApiService } from '../api/base-api.service';

@Injectable()
export class OfferApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  create(dto: CreateOfferBodyDto) {
    return this.baseApiService.post('/offers', dto, {});
  }
}
