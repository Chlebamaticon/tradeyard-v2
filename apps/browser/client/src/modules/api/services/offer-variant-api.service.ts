import { Injectable } from '@angular/core';

import {
  DeleteOfferVariantPathParamsDto,
  UpdateOfferVariantBodyDto,
  UpdateOfferVariantPathParamsDto,
} from '@tradeyard-v2/api-dtos';

import { BaseApiService } from './base-api.service';

@Injectable()
export class OfferVariantApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  update(dto: UpdateOfferVariantBodyDto & UpdateOfferVariantPathParamsDto) {
    return this.baseApiService.patch(
      `/offers/${dto.offer_id}/variants/${dto.offer_variant_id}`,
      dto,
      {}
    );
  }

  remove(dto: DeleteOfferVariantPathParamsDto) {
    return this.baseApiService.delete(
      `/offers/${dto.offer_id}/variants/${dto.offer_variant_id}`,
      {}
    );
  }
}
