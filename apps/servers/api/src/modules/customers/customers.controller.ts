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
  UpdateCustomer,
  UpdateCustomerBody,
  UpdateCustomerBodyDto,
  UpdateCustomerDto,
  UpdateCustomerPathParams,
  UpdateCustomerPathParamsDto,
} from '@tradeyard-v2/api-dtos';

import { CustomersService } from './customers.service';

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

  @Patch(':customer_id')
  async updateOne(
    @Param() pathParams: UpdateCustomerPathParamsDto,
    @Body() body: UpdateCustomerBodyDto
  ): Promise<UpdateCustomerDto> {
    const validatedPathParams = UpdateCustomerPathParams.parse(pathParams);
    const validatedBody = UpdateCustomerBody.parse(body);
    return UpdateCustomer.parse(
      await this.customersService.updateOne({
        ...validatedPathParams,
        ...validatedBody,
      })
    );
  }

  constructor(readonly customersService: CustomersService) {}
}
