import { Injectable } from '@angular/core';

import {
  ComplaintMessageDto,
  GetComplaintMessagesDto,
} from '@tradeyard-v2/api-dtos';

import { pagination, PaginationInit } from '../helpers/pagination';

import { BaseApiService } from './base-api.service';

@Injectable()
export class ComplaintApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  create(body: { order_id: string; body: string }) {
    return this.baseApiService.post(
      '/complaints',
      { ...body, sent_at: Date.now() },
      {}
    );
  }

  createMessage(body: { complaint_id: string; body: string }) {
    return this.baseApiService.post(
      `/complaints/${body.complaint_id}/messages`,
      {
        ...body,
        sent_at: Date.now(),
      },
      {}
    );
  }

  one(body: { complaintId: string }) {
    return pagination({
      initialPage: {
        offset: 0,
        limit: 25,
      },
      initialSearch: {
        timestamp: Date.now(),
      },
      request: (search, params) =>
        this.baseApiService.get(`/complaints/${body.complaintId}`, {
          params: {
            ...search,
            ...params,
          },
        }),
    });
  }

  manyMessages({
    initialParams: { offset = 0, limit = 20, timestamp = Date.now() },
    paramsNotifier,
    ...notifiers
  }: PaginationInit<{ complaintId?: string }>) {
    return pagination<ComplaintMessageDto, { complaintId?: string }>({
      initialPage: {
        offset,
        limit,
      },
      initialSearch: {
        timestamp,
      },
      paramsNotifier,
      ...notifiers,
      request: (search, params) =>
        this.baseApiService.get<GetComplaintMessagesDto>(
          `/complaints/${params.complaintId}/messages`,
          {
            params: {
              ...search,
              ...params,
            },
          }
        ),
    });
  }
}
