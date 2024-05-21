import { Inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatestWith,
  defer,
  delay,
  exhaustMap,
  finalize,
  from,
  tap,
} from 'rxjs';
import { Address } from 'viem';

import { OrderStatus } from '@tradeyard-v2/api-dtos';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

import {
  AuthService,
  TurnkeyWalletClient,
  TurnkeyWalletClientType,
} from '../../../../modules/auth';
import { ActiveOrderContractAddress } from '../providers';

type ContractInit = { functionName: string; args?: unknown[]; value?: bigint };

@Injectable()
export class BaseContract {
  loading = new BehaviorSubject<boolean>(false);
  stateChanges = new BehaviorSubject<void>(undefined);

  getTokenAmount(): Observable<bigint> {
    return defer(() => this.readContractOnce<bigint>('getTokenAmount'));
  }

  getTokenAddress(): Observable<bigint> {
    return defer(() => this.readContractOnce<bigint>('getTokenAddress'));
  }

  getLastTransitionAt(): Observable<bigint> {
    return defer(() => this.readContract<bigint>('getLastTransitionAt'));
  }

  getStatus(): Observable<OrderStatus> {
    return defer(() => this.readContract<OrderStatus>('getStatus'));
  }

  getPreviousStatus(): Observable<OrderStatus> {
    return defer(() => this.readContract<OrderStatus>('getPreviousStatus'));
  }

  getCustomerAddress(): Observable<Address> {
    return defer(() => this.readContractOnce<Address>('getCustomerAddress'));
  }

  getMerchantAddress(): Observable<Address> {
    return defer(() => this.readContractOnce<Address>('getMerchantAddress'));
  }

  readContractOnce<T = unknown>(functionName: string): Observable<T> {
    return from(this.contractAddress).pipe(
      combineLatestWith(this.walletClient),
      tap((args) => console.debug('readContractOnce', functionName, args)),
      exhaustMap(
        ([address, walletClient]) =>
          walletClient.readContract({
            address,
            abi: artifact.abi,
            functionName,
          }) as Promise<T>
      )
    );
  }

  readContract<T = unknown>(functionName: string): Observable<T> {
    return from(this.contractAddress).pipe(
      combineLatestWith(this.walletClient, this.stateChanges),
      tap((args) => console.debug('readContract', functionName, args)),
      exhaustMap(
        ([address, walletClient]) =>
          walletClient.readContract({
            address,
            abi: artifact.abi,
            functionName,
          }) as Promise<T>
      )
    );
  }

  simulateContract(init: ContractInit) {
    return defer(() =>
      from(this.contractAddress).pipe(
        combineLatestWith(this.walletClient),
        tap(([to, walletClient]) =>
          console.debug('simulateContract', init, {
            from: walletClient.account.address,
            to,
          })
        ),
        exhaustMap(([to, walletClient]) =>
          walletClient.simulateContract({
            address: to,
            value: init.value,
            abi: artifact.abi,
            functionName: init.functionName,
            args: init.args,
          })
        )
      )
    );
  }

  writeContract(init: ContractInit) {
    this.loading.next(true);
    return this.simulateContract(init).pipe(
      combineLatestWith(this.walletClient),
      tap(([to, walletClient]) =>
        console.debug('writeContract', init, {
          from: walletClient.account.address,
          to,
        })
      ),
      exhaustMap(([{ request }, walletClient]) =>
        walletClient
          .writeContract(request)
          .then((hash) => walletClient.waitForTransactionReceipt({ hash }))
      ),
      tap(() => this.stateChanges.next()),
      finalize(() => this.loading.next(false))
    );
  }

  createTransitionMethod() {
    return (functionName: string) => this.writeContract({ functionName });
  }

  constructor(
    readonly auth: AuthService,
    @Inject(TurnkeyWalletClient)
    readonly walletClient: Observable<TurnkeyWalletClientType>,
    @Inject(ActiveOrderContractAddress)
    readonly contractAddress: Promise<Address>
  ) {}
}
