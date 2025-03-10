import { Injectable } from '@angular/core';
import { defer } from 'rxjs';

import { BaseContractFacade } from './base-contract.facade';

@Injectable()
export class CustomerContractFacade {
  deposit(value: bigint) {
    return defer(() =>
      this.base.writeContract({ functionName: 'deposit', value })
    );
  }

  release() {
    return this.#transition('release');
  }

  complaint() {
    return this.#transition('submitComplaint');
  }

  #transition(functionName: string) {
    const method = this.base.createTransitionMethod();
    return method(functionName);
  }

  constructor(readonly base: BaseContractFacade) {}
}
