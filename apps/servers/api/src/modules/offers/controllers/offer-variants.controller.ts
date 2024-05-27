import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LessThanOrEqual } from 'typeorm';

import {
  CreateOfferVariant,
  CreateOfferVariantBody,
  CreateOfferVariantBodyDto,
  CreateOfferVariantDto,
  DeleteOfferVariantPathParams,
  DeleteOfferVariantPathParamsDto,
  GetOfferVariants,
  GetOfferVariantsDto,
  GetOfferVariantsPathParams,
  GetOfferVariantsPathParamsDto,
  GetOfferVariantsQueryParams,
  GetOfferVariantsQueryParamsDto,
  UpdateOfferVariantBody,
  UpdateOfferVariantBodyDto,
  UpdateOfferVariantPathParams,
  UpdateOfferVariantPathParamsDto,
} from '@tradeyard-v2/api-dtos';

import { MerchantOnly } from '../../auth';
import { OfferVariantService } from '../services';

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

  @MerchantOnly
  @Post()
  async create(
    @Body() body: CreateOfferVariantBodyDto
  ): Promise<CreateOfferVariantDto> {
    return this.offerVariantService.create(CreateOfferVariantBody.parse(body));
  }

  @MerchantOnly
  @Patch(':offer_variant_id')
  async update(
    @Param() pathParams: Required<UpdateOfferVariantPathParamsDto>,
    @Body() body: UpdateOfferVariantBodyDto
  ): Promise<CreateOfferVariantDto> {
    const validatedPathParams =
      UpdateOfferVariantPathParams.required().parse(pathParams);
    const validatedBody = UpdateOfferVariantBody.parse(body);
    return this.offerVariantService.updateOne({
      ...validatedPathParams,
      ...validatedBody,
    });
  }

  @MerchantOnly
  @Delete(':offer_variant_id')
  async delete(@Param() pathParams: DeleteOfferVariantPathParamsDto) {
    const validatedPathParams = DeleteOfferVariantPathParams.parse(pathParams);
    return this.offerVariantService.deleteOne(validatedPathParams);
  }
}
