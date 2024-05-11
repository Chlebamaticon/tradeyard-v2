import { Injectable } from '@angular/core';

import { BaseApiService } from './base-api.service';

@Injectable()
export class ComplaintDecisionApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  reject(body: { complaint_id: string }) {
    return this.baseApiService.put(
      `/complaints/${body.complaint_id}`,
      { decision: 'rejected' },
      {}
    );
  }

  release(body: { complaint_id: string }) {
    return this.baseApiService.put(
      `/complaints/${body.complaint_id}`,
      { decision: 'released' },
      {}
    );
  }

  refund(body: { complaint_id: string }) {
    return this.baseApiService.put(
      `/complaints/${body.complaint_id}`,
      { decision: 'refunded' },
      {}
    );
  }
}
