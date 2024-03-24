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
import { OffersService } from './offers.service';

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
    @Query() queryParams: GetOffersQueryParamsDto
  ): Promise<GetOffersDto> {
    const validatedQueryParams = GetOffersQueryParams.parse(queryParams);
    return GetOffers.parse(
      await this.offersService.getMany(validatedQueryParams)
    );
  }

  @Post()
  async createOne(@Body() body: CreateOfferBodyDto): Promise<CreateOfferDto> {
    const validatedBody = CreateOfferBody.parse(body);
    return CreateOffer.parse(await this.offersService.createOne(validatedBody));
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

  constructor(readonly offersService: OffersService) {}
}
