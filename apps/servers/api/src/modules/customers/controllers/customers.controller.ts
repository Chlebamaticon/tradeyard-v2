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
  CreateCustomer,
  CreateCustomerBody,
  CreateCustomerBodyDto,
  CreateCustomerDto,
  GetCustomer,
  GetCustomerDto,
  GetCustomerPathParams,
  GetCustomerPathParamsDto,
  GetCustomers,
  GetCustomersDto,
  GetCustomersQueryParams,
  GetCustomersQueryParamsDto,
} from '@tradeyard-v2/api-dtos';

import { CustomerService } from '../services';

@Controller()
export class CustomersController {
  @Get(':customer_id')
  async getOne(
    @Param() pathParams: GetCustomerPathParamsDto
  ): Promise<GetCustomerDto> {
    const validatedPathParams = GetCustomerPathParams.parse(pathParams);
    return GetCustomer.parse(
      await this.customersService.getOne(validatedPathParams)
    );
  }

  @Get()
  async getMany(
    @Query() queryParams: GetCustomersQueryParamsDto
  ): Promise<GetCustomersDto> {
    const validatedQueryParams = GetCustomersQueryParams.parse(queryParams);
    return GetCustomers.parse(
      await this.customersService.getMany(validatedQueryParams)
    );
  }

  @Post()
  async createOne(
    @Body() body: CreateCustomerBodyDto
  ): Promise<CreateCustomerDto> {
    const validatedBody = CreateCustomerBody.parse(body);
    return CreateCustomer.parse(
      await this.customersService.createOne(validatedBody)
    );
  }

  constructor(readonly customersService: CustomerService) {}
}
