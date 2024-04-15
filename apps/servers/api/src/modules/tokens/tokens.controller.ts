import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import {
  GetToken,
  GetTokenDto,
  GetTokenPathParams,
  GetTokenPathParamsDto,
  GetTokens,
  GetTokensDto,
  GetTokensQueryParams,
  GetTokensQueryParamsDto,
} from '@tradeyard-v2/api-dtos';

import { TokenService } from './token.service';

@Controller()
export class TokensController {
  @Get(':token_id')
  async getOne(
    @Param() pathParams: GetTokenPathParamsDto
  ): Promise<GetTokenDto> {
    const validatedPathParams = GetTokenPathParams.parse(pathParams);
    return GetToken.parse(await this.tokenService.getOne(validatedPathParams));
  }

  @Get()
  async getMany(
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Query('timestamp', new ParseIntPipe({ optional: true }))
    timestamp = Date.now(),
    @Query('limit', new ParseIntPipe({ optional: true })) limit,
    @Query() queryParams: GetTokensQueryParamsDto
  ): Promise<GetTokensDto> {
    const validatedQueryParams = GetTokensQueryParams.parse({
      ...queryParams,
      offset,
      timestamp,
      limit,
    });
    return GetTokens.parse(
      await this.tokenService.getMany(validatedQueryParams)
    );
  }

  constructor(readonly tokenService: TokenService) {}
}
