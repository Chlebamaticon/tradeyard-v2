import { Injectable } from '@angular/core';
import { Wallet } from 'alchemy-sdk';
import { defer, exhaustMap } from 'rxjs';

import { BaseContract } from './base-contract.facade';

@Injectable()
export class ModeratorContract {
  #wallet = new Wallet(
    'c9d90837bd63948e6f18c52373602c95057348eb9afe13e4abf39701a2db1dd8'
  );

  releaseComplaint() {
    return defer(() =>
      this.base
        .simulateContract(this.#wallet, { functionName: 'releaseComplaint' })
        .pipe(
          exhaustMap(() =>
            this.base.writeContract(this.#wallet, {
              functionName: 'releaseComplaint',
            })
          )
        )
    );
  }

  refundComplaint() {
    return defer(() =>
      this.base
        .simulateContract(this.#wallet, { functionName: 'refundComplaint' })
        .pipe(
          exhaustMap(() =>
            this.base.writeContract(this.#wallet, {
              functionName: 'refundComplaint',
            })
          )
        )
    );
  }

  rejectComplaint() {
    return defer(() =>
      this.base
        .simulateContract(this.#wallet, { functionName: 'rejectComplaint' })
        .pipe(
          exhaustMap(() =>
            this.base.writeContract(this.#wallet, {
              functionName: 'rejectComplaint',
            })
          )
        )
    );
  }

  constructor(readonly base: BaseContract) {}
}
