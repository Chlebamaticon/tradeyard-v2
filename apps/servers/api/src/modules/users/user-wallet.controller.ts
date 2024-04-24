import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import {
  CreateUser,
  CreateUserBody,
  CreateUserBodyDto,
  CreateUserDto,
  GetUserWallets,
  GetUserWalletsDto,
  GetUserWalletsQueryParams,
  GetUserWalletsQueryParamsDto,
} from '@tradeyard-v2/api-dtos';

import { User } from '../auth';

import { UserWalletService } from './user-wallet.service';

@Controller()
export class UserWalletController {
  @Get()
  async getMany(
    @Query() queryParams: GetUserWalletsQueryParamsDto,
    @User('user_id') user_id: string
  ): Promise<GetUserWalletsDto> {
    const validatedQueryParams = GetUserWalletsQueryParams.parse(queryParams);
    return GetUserWallets.parse(
      await this.userWalletService.getMany({ ...validatedQueryParams, user_id })
    );
  }

  @Post()
  async createOne(
    @Body() body: CreateUserBodyDto,
    @User('user_id') user_id: string
  ): Promise<CreateUserDto> {
    const validatedBody = CreateUserBody.parse(body);
    return CreateUser.parse(
      await this.userWalletService.createOne({
        ...validatedBody,
        user_id,
      })
    );
  }

  constructor(readonly userWalletService: UserWalletService) {}
}
