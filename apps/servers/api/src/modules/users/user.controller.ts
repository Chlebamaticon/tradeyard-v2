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
  CreateUser,
  CreateUserBody,
  CreateUserBodyDto,
  CreateUserDto,
  GetUser,
  GetUserDto,
  GetUserPathParams,
  GetUserPathParamsDto,
  GetUsers,
  GetUsersDto,
  GetUsersQueryParams,
  GetUsersQueryParamsDto,
  UpdateUser,
  UpdateUserBody,
  UpdateUserBodyDto,
  UpdateUserDto,
  UpdateUserPathParams,
  UpdateUserPathParamsDto,
} from '@tradeyard-v2/api-dtos';

import { UserService } from './user.service';

@Controller()
export class UsersController {
  @Get(':user_id')
  async getOne(@Param() pathParams: GetUserPathParamsDto): Promise<GetUserDto> {
    const validatedPathParams = GetUserPathParams.parse(pathParams);
    return GetUser.parse(await this.usersService.getOne(validatedPathParams));
  }

  @Get()
  async getMany(
    @Query() queryParams: GetUsersQueryParamsDto
  ): Promise<GetUsersDto> {
    const validatedQueryParams = GetUsersQueryParams.parse(queryParams);
    return GetUsers.parse(
      await this.usersService.getMany(validatedQueryParams)
    );
  }

  @Post()
  async createOne(@Body() body: CreateUserBodyDto): Promise<CreateUserDto> {
    const validatedBody = CreateUserBody.parse(body);
    return CreateUser.parse(await this.usersService.createOne(validatedBody));
  }

  @Patch(':user_id')
  async updateOne(
    @Param() pathParams: UpdateUserPathParamsDto,
    @Body() body: UpdateUserBodyDto
  ): Promise<UpdateUserDto> {
    const validatedPathParams = UpdateUserPathParams.parse(pathParams);
    const validatedBody = UpdateUserBody.parse(body);
    return UpdateUser.parse(
      await this.usersService.updateOne({
        ...validatedPathParams,
        ...validatedBody,
      })
    );
  }

  constructor(readonly usersService: UserService) {}
}
