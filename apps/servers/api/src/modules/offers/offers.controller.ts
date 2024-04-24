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

import { User } from '../auth';

import { OfferService } from './offers.service';

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
    const offers = await this.offersService.getMany(validatedQueryParams);
    return GetOffers.parse(offers);
  }

  @Post()
  async createOne(
    @Body() body: CreateOfferBodyDto,
    @User('merchant_id') merchant_id: string
  ): Promise<CreateOfferDto> {
    console.log(body, merchant_id);
    const validatedBody = CreateOfferBody.parse({ body });
    console.log(validatedBody);

    return CreateOffer.parse(
      await this.offersService.createOne({ ...validatedBody, merchant_id })
    );
  }

  @Patch(':offer_id')
  async updateOne(
    @Param() pathParams: UpdateOfferPathParamsDto,
    @Body() body: UpdateOfferBodyDto
  ): Promise<UpdateOfferDto> {
    const validatedPathParams = UpdateOfferPathParams.parse(pathParams);
    const validatedBody = UpdateOfferBody.parse(body);
    return UpdateOffer.parse(
      await this.offersService.updateOne({
        ...validatedPathParams,
        ...validatedBody,
      })
    );
  }

  constructor(readonly offersService: OfferService) {}
}
