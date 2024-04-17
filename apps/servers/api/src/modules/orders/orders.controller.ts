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
  CreateOrder,
  CreateOrderBody,
  CreateOrderBodyDto,
  CreateOrderDto,
  GetOrder,
  GetOrderDto,
  GetOrderPathParams,
  GetOrderPathParamsDto,
  GetOrders,
  GetOrdersDto,
  GetOrdersQueryParams,
  GetOrdersQueryParamsDto,
} from '@tradeyard-v2/api-dtos';

import { OrderService } from './order.service';

@Controller()
export class OrdersController {
  @Get(':order_id')
  async getOne(
    @Param() pathParams: GetOrderPathParamsDto
  ): Promise<GetOrderDto> {
    const validatedPathParams = GetOrderPathParams.parse(pathParams);
    return GetOrder.parse(await this.orderService.getOne(validatedPathParams));
  }

  @Get()
  async getMany(
    @Query() queryParams: GetOrdersQueryParamsDto
  ): Promise<GetOrdersDto> {
    const validatedQueryParams = GetOrdersQueryParams.parse(queryParams);
    return GetOrders.parse(
      await this.orderService.getMany(validatedQueryParams)
    );
  }

  @Post()
  async createOne(@Body() body: CreateOrderBodyDto): Promise<CreateOrderDto> {
    const validatedBody = CreateOrderBody.parse(body);
    return CreateOrder.parse(await this.orderService.createOne(validatedBody));
  }

  constructor(readonly orderService: OrderService) {}
}
