import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import * as express from 'express';

import {
  CreateUser,
  CreateUserDto,
  CreateUserWalletBody,
  CreateUserWalletBodyDto,
  GetUserWallets,
  GetUserWalletsDto,
  GetUserWalletsQueryParams,
} from '@tradeyard-v2/api-dtos';

import { UserWalletService } from './user-wallet.service';

@Controller()
export class UserWalletController {
  @Get()
  async getMany(
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Query('timestamp', new ParseIntPipe({ optional: true }))
    timestamp = Date.now(),
    @Query('limit', new ParseIntPipe({ optional: true })) limit,
    @Request() req: express.Request
  ): Promise<GetUserWalletsDto> {
    const validatedQueryParams = GetUserWalletsQueryParams.parse({
      offset,
      timestamp,
      limit,
    });
    return GetUserWallets.parse(
      await this.userWalletService.getMany({
        ...validatedQueryParams,
        user_id: req.user.user_id,
      })
    );
  }

  @Post()
  async createOne(
    @Body() body: CreateUserWalletBodyDto,
    @Request() req: express.Request
  ): Promise<CreateUserDto> {
    const validatedBody = CreateUserWalletBody.parse(body);
    return CreateUser.parse(
      await this.userWalletService.createOne({
        ...validatedBody,
        user_id: req.user.user_id,
      })
    );
  }

  constructor(readonly userWalletService: UserWalletService) {}
}
