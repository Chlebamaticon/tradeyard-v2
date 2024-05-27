import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  CreateOffer,
  CreateOfferBody,
  CreateOfferBodyDto,
  CreateOfferDto,
  GetOffer,
  GetOfferDto,
  GetOfferPathParams,
  GetOfferPathParamsDto,
  GetOffers,
  GetOffersDto,
  GetOffersQueryParams,
  GetOffersQueryParamsDto,
  UpdateOffer,
  UpdateOfferBody,
  UpdateOfferBodyDto,
  UpdateOfferDto,
  UpdateOfferPathParams,
  UpdateOfferPathParamsDto,
} from '@tradeyard-v2/api-dtos';

import { MerchantOnly, User } from '../../auth';
import { OfferService } from '../services';

@Controller()
export class OffersController {
  @Get(':offer_id')
  async getOne(
    @Param() pathParams: GetOfferPathParamsDto
  ): Promise<GetOfferDto> {
    const validatedPathParams = GetOfferPathParams.parse(pathParams);
    return GetOffer.parse(await this.offersService.getOne(validatedPathParams));
  }

  @Get()
  async getMany(
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Query('timestamp', new ParseIntPipe({ optional: true }))
    timestamp = Date.now(),
    @Query('limit', new ParseIntPipe({ optional: true })) limit,
    @Query() queryParams: GetOffersQueryParamsDto
  ): Promise<GetOffersDto> {
    const validatedQueryParams = GetOffersQueryParams.parse({
      ...queryParams,
      offset,
      timestamp,
      limit,
    });

    return GetOffers.parse(
      await this.offersService.getMany(validatedQueryParams)
    );
  }

  @MerchantOnly
  @Post()
  async createOne(
    @Body() body: CreateOfferBodyDto,
    @User('merchant_id') merchant_id: string
  ): Promise<CreateOfferDto> {
    const validatedBody = CreateOfferBody.parse(body);
    return CreateOffer.parse(
      await this.offersService.createOne({ ...validatedBody, merchant_id })
    );
  }

  @MerchantOnly
  @Patch(':offer_id')
  async updateOne(
    @Param() pathParams: UpdateOfferPathParamsDto,
    @Body() body: UpdateOfferBodyDto,
    @User('merchant_id') merchant_id: string
  ): Promise<UpdateOfferDto> {
    const validatedPathParams = UpdateOfferPathParams.parse(pathParams);
    const validatedBody = UpdateOfferBody.parse(body);
    return UpdateOffer.parse(
      await this.offersService.updateOne({
        ...validatedPathParams,
        ...validatedBody,
        merchant_id,
      })
    );
  }

  constructor(readonly offersService: OfferService) {}
}
