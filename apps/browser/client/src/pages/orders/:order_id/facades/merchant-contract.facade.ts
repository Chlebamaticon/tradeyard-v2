import { Injectable } from '@angular/core';

import { BaseContractFacade } from './base-contract.facade';

@Injectable()
export class MerchantContractFacade {
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
    const method = this.base.createTransitionMethod();
    return method(functionName);
  }

  constructor(readonly base: BaseContractFacade) {}
}
