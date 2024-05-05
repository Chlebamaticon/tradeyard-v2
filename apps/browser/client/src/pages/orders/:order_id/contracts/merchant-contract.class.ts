import { Injectable } from '@angular/core';
import { Wallet } from 'alchemy-sdk';
import { defer, delay, exhaustMap } from 'rxjs';

import { BaseContract } from './base-contract.class';

@Injectable()
export class MerchantContract {
  #wallet = new Wallet(
    '1b8de55c68fe2f18b00ee8530e5261f69ef6e1dd4e34324c4f45214eabf9e84e'
  );

  confirm() {
    return this.#transition('confirm');
  }

  cancel() {
    return this.#transition('cancel');
  }

  shipping() {
    return this.#transition('shipping');
  }

  shipped() {
    return this.#transition('shipped');
  }

  release() {
    return this.#transition('release');
  }

  complaint() {
    return this.#transition('submitComplaint');
  }

  #transition(functionName: string) {
    return defer(() =>
      this.base.simulateContract(this.#wallet, { functionName }).pipe(
        /**
         * Alchemy does limit the RPC throughput; therefore
         * we need to add artifical delay to avoid rate limiting.
         * @todo To be removed once Alchemy upgrade plan.
         */
        delay(1000),
        exhaustMap(() =>
          this.base.writeContract(this.#wallet, {
            functionName,
          })
        )
      )
    );
  }

  constructor(readonly base: BaseContract) {}
}
