import { Injectable } from '@angular/core';
import { Wallet } from 'alchemy-sdk';
import { defer, exhaustMap } from 'rxjs';

import { BaseContract } from './base-contract.class';

@Injectable()
export class CustomerContract {
  #wallet = new Wallet(
    'c9d90837bd63948e6f18c52373602c95057348eb9afe13e4abf39701a2db1dd8'
  );

  deposit(value: bigint) {
    return defer(() =>
      this.base
        .simulateContract(this.#wallet, { functionName: 'deposit', value })
        .pipe(
          exhaustMap(() =>
            this.base.writeContract(this.#wallet, {
              functionName: 'deposit',
              value,
            })
          )
        )
    );
  }

  release() {
    return defer(() =>
      this.base
        .simulateContract(this.#wallet, { functionName: 'release' })
        .pipe(
          exhaustMap(() =>
            this.base.writeContract(this.#wallet, {
              functionName: 'release',
            })
          )
        )
    );
  }

  complaint() {
    return defer(() =>
      this.base
        .simulateContract(this.#wallet, { functionName: 'complaint' })
        .pipe(
          exhaustMap(() =>
            this.base.writeContract(this.#wallet, {
              functionName: 'submitComplaint',
            })
          )
        )
    );
  }

  constructor(readonly base: BaseContract) {}
}
