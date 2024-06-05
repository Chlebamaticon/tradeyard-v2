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
  CreateTurnkeyWallet,
  CreateTurnkeyWalletBody,
  CreateTurnkeyWalletBodyDto,
  CreateTurnkeyWalletDto,
  GetUserWallets,
  GetUserWalletsDto,
  GetUserWalletsQueryParams,
  UserExtendedDto,
} from '@tradeyard-v2/api-dtos';

import { User } from '../../auth/decorators';
import { UserWalletService } from '../services/user-wallet.service';

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
  async createTurnkeyWallet(
    @Body() body: CreateTurnkeyWalletBodyDto,
    @User() { email, user_id }: UserExtendedDto
  ): Promise<CreateTurnkeyWalletDto> {
    const validatedBody = CreateTurnkeyWalletBody.required()
      .strict()
      .parse(body);
    return CreateTurnkeyWallet.parse(
      await this.userWalletService.createTurnkeyWallet({
        ...validatedBody,
        user_id,
        email,
      })
    );
  }

  constructor(readonly userWalletService: UserWalletService) {}
}
