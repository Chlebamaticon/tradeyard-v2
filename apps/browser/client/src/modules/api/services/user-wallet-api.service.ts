import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateTurnkeyWalletBodyDto,
  CreateTurnkeyWalletDto,
  GetUserWalletsDto,
} from '@tradeyard-v2/api-dtos';

import { pagination, PaginationInit } from '..';

import { BaseApiService } from './base-api.service';

@Injectable()
export class UserWalletApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  create(dto: CreateTurnkeyWalletBodyDto): Observable<CreateTurnkeyWalletDto> {
    return this.baseApiService.post<CreateTurnkeyWalletDto>(
      '/wallets',
      dto,
      {}
    );
  }

  many({
    initialParams: { offset = 0, limit = 20, timestamp = Date.now() },
    ...notifiers
  }: PaginationInit) {
    return pagination({
      ...notifiers,
      initialPage: { offset, limit },
      initialSearch: { timestamp },
      request: (search, params) =>
        this.baseApiService.get<GetUserWalletsDto>('/wallets', {
          params: { ...search, ...params },
        }),
    });
  }
}
