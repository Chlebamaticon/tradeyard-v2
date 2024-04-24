import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
} from '@tradeyard-v2/api-dtos';

import { User } from '../auth';

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
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Query('timestamp', new ParseIntPipe({ optional: true }))
    timestamp = Date.now(),
    @Query('limit', new ParseIntPipe({ optional: true })) limit,
    @User('customer_id') customer_id: string,
    @User('merchant_id') merchant_id: string
  ): Promise<GetOrdersDto> {
    const validatedQueryParams = GetOrdersQueryParams.parse({
      offset,
      limit,
      timestamp,
    });
    return GetOrders.parse(
      await this.orderService.getMany({
        customer_id,
        merchant_id,
        ...validatedQueryParams,
      })
    );
  }

  @Post()
  async createOne(@Body() body: CreateOrderBodyDto): Promise<CreateOrderDto> {
    const validatedBody = CreateOrderBody.strict().parse(body);
    return CreateOrder.parse(await this.orderService.createOne(validatedBody));
  }

  constructor(readonly orderService: OrderService) {}
}
