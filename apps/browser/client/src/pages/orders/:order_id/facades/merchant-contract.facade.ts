import { Injectable } from '@angular/core';
import { Wallet } from 'alchemy-sdk';
import { defer, delay, exhaustMap } from 'rxjs';

import { BaseContract } from './base-contract.facade';

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
    const method = this.base.createTransitionMethod(this.#wallet);
    return method(functionName);
  }

  constructor(readonly base: BaseContract) {}
}
