import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LessThanOrEqual } from 'typeorm';

import {
  CreateOfferVariant,
  CreateOfferVariantBodyDto,
  CreateOfferVariantDto,
  GetOfferVariants,
  GetOfferVariantsDto,
  GetOfferVariantsPathParams,
  GetOfferVariantsPathParamsDto,
  GetOfferVariantsQueryParams,
  GetOfferVariantsQueryParamsDto,
} from '@tradeyard-v2/api-dtos';

import { OfferVariantService } from './offer-variant.service';

@Controller()
export class OfferVariantsController {
  constructor(readonly offerVariantService: OfferVariantService) {}

  @Get()
  async getMany(
    @Param() params: GetOfferVariantsPathParamsDto,
    @Query() queries: GetOfferVariantsQueryParamsDto
  ): Promise<GetOfferVariantsDto> {
    const pathParams = GetOfferVariantsPathParams.parse(params);
    const queryParams = GetOfferVariantsQueryParams.parse(queries);
    return GetOfferVariants.parse(
      await this.offerVariantService.getMany({
        where: {
          offer_id: pathParams.offer_id,
          created_at: queryParams.timestamp
            ? LessThanOrEqual(new Date(queryParams.timestamp))
            : undefined,
        },
        offset: queryParams.offset,
        limit: queryParams.limit,
      })
    );
  }

  @Post()
  async create(
    @Body() body: CreateOfferVariantBodyDto
  ): Promise<CreateOfferVariantDto> {
    return this.offerVariantService.create(CreateOfferVariant.parse(body));
  }
}
