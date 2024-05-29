import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ComplaintDto } from '@tradeyard-v2/api-dtos';

import { ComplaintDecisionApiService } from '../../../../modules/api/services';
import { ActiveOrderComplaint } from '../providers';

@Injectable()
export class ModeratorContractFacade {
  constructor(
    @Inject(ActiveOrderComplaint) readonly complaint: ComplaintDto,
    readonly complaintDecisionApi: ComplaintDecisionApiService
  ) {}

  async release() {
    const { complaint_id } = await this.complaint;
    await firstValueFrom(
      this.complaintDecisionApi.release({
        complaint_id,
      })
    );
  }

  async refund() {
    const { complaint_id } = await this.complaint;
    await firstValueFrom(
      this.complaintDecisionApi.refund({
        complaint_id,
      })
    );
  }

  async reject() {
    const { complaint_id } = await this.complaint;
    await firstValueFrom(
      this.complaintDecisionApi.reject({
        complaint_id,
      })
    );
  }
}
