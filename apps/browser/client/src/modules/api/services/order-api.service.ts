import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateOrderBodyDto,
  CreateOrderDto,
  GetOrderDto,
  GetOrdersDto,
  OrderDto,
} from '@tradeyard-v2/api-dtos';

import { pagination, PaginationInit } from '..';

import { BaseApiService } from './base-api.service';

@Injectable()
export class OrderApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  create(dto: CreateOrderBodyDto): Observable<CreateOrderDto> {
    return this.baseApiService.post('/orders', dto, {});
  }

  one({ order_id }: { order_id: string }): Observable<GetOrderDto> {
    return this.baseApiService.get<GetOrderDto>(`/orders/${order_id}`, {});
  }

  many({
    initialParams: { offset = 0, limit = 20, timestamp = Date.now() },
    ...notifiers
  }: PaginationInit) {
    return pagination<OrderDto>({
      ...notifiers,
      initialPage: { offset, limit },
      initialSearch: { timestamp },
      request: (search, params) =>
        this.baseApiService.get<GetOrdersDto>('/orders', {
          params: { ...search, ...params },
        }),
    });
  }
}
