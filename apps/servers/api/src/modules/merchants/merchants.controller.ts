import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  CreateMerchant,
  CreateMerchantBody,
  CreateMerchantBodyDto,
  CreateMerchantDto,
  GetMerchant,
  GetMerchantDto,
  GetMerchantPathParams,
  GetMerchantPathParamsDto,
  GetMerchants,
  GetMerchantsDto,
  GetMerchantsQueryParams,
  GetMerchantsQueryParamsDto,
  UpdateMerchant,
  UpdateMerchantBody,
  UpdateMerchantBodyDto,
  UpdateMerchantDto,
  UpdateMerchantPathParams,
  UpdateMerchantPathParamsDto,
} from '@tradeyard-v2/api-dtos';

import { MerchantsService } from './merchants.service';

@Controller()
export class MerchantsController {
  @Get(':merchant_id')
  async getOne(
    @Param() pathParams: GetMerchantPathParamsDto
  ): Promise<GetMerchantDto> {
    const validatedPathParams = GetMerchantPathParams.parse(pathParams);
    return GetMerchant.parse(
      await this.merchantsService.getOne(validatedPathParams)
    );
  }

  @Get()
  async getMany(
    @Query() queryParams: GetMerchantsQueryParamsDto
  ): Promise<GetMerchantsDto> {
    const validatedQueryParams = GetMerchantsQueryParams.parse(queryParams);
    return GetMerchants.parse(
      await this.merchantsService.getMany(validatedQueryParams)
    );
  }

  @Post()
  async createOne(
    @Body() body: CreateMerchantBodyDto
  ): Promise<CreateMerchantDto> {
    const validatedBody = CreateMerchantBody.parse(body);
    return CreateMerchant.parse(
      await this.merchantsService.createOne(validatedBody)
    );
  }

  @Patch(':merchant_id')
  async updateOne(
    @Param() pathParams: UpdateMerchantPathParamsDto,
    @Body() body: UpdateMerchantBodyDto
  ): Promise<UpdateMerchantDto> {
    const validatedPathParams = UpdateMerchantPathParams.parse(pathParams);
    const validatedBody = UpdateMerchantBody.parse(body);
    return UpdateMerchant.parse(
      await this.merchantsService.updateOne({
        ...validatedPathParams,
        ...validatedBody,
      })
    );
  }

  constructor(readonly merchantsService: MerchantsService) {}
}
