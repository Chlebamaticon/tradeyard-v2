import { Inject, Injectable } from '@angular/core';
import {
  Alchemy,
  Network,
  SimulateExecutionResponse,
  Wallet,
} from 'alchemy-sdk';
import {
  BehaviorSubject,
  Observable,
  combineLatestWith,
  defer,
  delay,
  exhaustMap,
  from,
  map,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  Address,
  decodeErrorResult,
  encodeFunctionData,
  isHex,
  toHex,
} from 'viem';

import { currentChain, OrderStatus } from '@tradeyard-v2/api-dtos';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

import { AuthService } from '../../../../modules/auth';
import { ActiveOrderContractAddress } from '../providers';

type ContractInit = { functionName: string; args?: unknown[]; value?: bigint };

@Injectable()
export class BaseContract {
  alchemy = new Alchemy({
    apiKey: '6oy61c9A1D8Dm4e_rZ0KAAwf5KOZRCWM',
    network: Network.ETH_SEPOLIA,
  });

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
      tap((args) => console.debug('readContractOnce', functionName, args)),
      exhaustMap(
        (address) =>
          this.auth.walletClient.readContract({
            address,
            abi: artifact.abi,
            functionName,
          }) as Promise<T>
      )
    );
  }

  readContract<T = unknown>(functionName: string): Observable<T> {
    return from(this.contractAddress).pipe(
      combineLatestWith(this.stateChanges),
      tap((args) => console.debug('readContract', functionName, args)),
      exhaustMap(
        ([address]) =>
          this.auth.walletClient.readContract({
            address,
            abi: artifact.abi,
            functionName,
          }) as Promise<T>
      )
    );
  }

  simulateContract(fromWallet: Wallet, init: ContractInit) {
    return defer(() =>
      from(this.contractAddress).pipe(
        tap((toAddress) =>
          console.debug('simulateContract', init, {
            from: fromWallet,
            to: toAddress,
          })
        ),
        exhaustMap((toAddress) =>
          from(
            this.alchemy.transact.simulateExecution({
              from: fromWallet.address,
              to: toAddress,
              value: init.value ? toHex(init.value) : undefined,
              data: encodeFunctionData({
                abi: artifact.abi,
                functionName: init.functionName,
                args: init.args ? init.args : [],
              }),
            })
          )
        ),
        switchMap(({ calls }: SimulateExecutionResponse) => {
          const [latestCall] = calls;
          if (latestCall.error) {
            return throwError(() =>
              decodeErrorResult({
                abi: artifact.abi,
                data: isHex(latestCall.output)
                  ? latestCall.output
                  : `0x${latestCall.output}`,
              })
            );
          }
          return [latestCall];
        })
      )
    );
  }

  writeContract(fromWallet: Wallet, init: ContractInit) {
    return defer(() =>
      from(this.contractAddress).pipe(
        tap((toAddress) =>
          console.debug('writeContract', init, {
            from: fromWallet,
            to: toAddress,
          })
        ),
        combineLatestWith(
          this.alchemy.core.getTransactionCount(fromWallet.address, 'latest'),
          this.alchemy.core.getFeeData()
        ),
        exhaustMap(([to, nonce, feeData]) =>
          this.auth.walletClient.sendTransaction({
            to,
            nonce,
            value: init.value ? init.value : 0n,
            data: encodeFunctionData({
              abi: artifact.abi,
              functionName: init.functionName,
              args: init.args ? init.args : [],
            }),
            type: 'eip1559',
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!.toBigInt(),
            maxFeePerGas: feeData.maxFeePerGas!.toBigInt(),
          } as const)
        ),
        exhaustMap((hash) => this.alchemy.core.waitForTransaction(hash)),
        tap(() => this.stateChanges.next())
      )
    );
  }

  writeContractViaStaticWallet(fromWallet: Wallet, init: ContractInit) {
    return defer(() =>
      from(this.contractAddress).pipe(
        tap((toAddress) =>
          console.debug('writeContract', init, {
            from: fromWallet,
            to: toAddress,
          })
        ),
        combineLatestWith(
          this.alchemy.core.getTransactionCount(fromWallet.address, 'latest'),
          this.alchemy.core.getFeeData()
        ),
        map(([to, nonce, feeData]) => ({
          chainId: currentChain.id,
          to,
          nonce,
          value: init.value ? init.value : 0n,
          data: encodeFunctionData({
            abi: artifact.abi,
            functionName: init.functionName,
            args: init.args ? init.args : [],
          }),
          type: 2,
          gasLimit: '100000',
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!.toBigInt(),
          maxFeePerGas: feeData.maxFeePerGas!.toBigInt(),
        })),
        tap(console.debug),
        exhaustMap((unsignedTransaction) =>
          fromWallet.signTransaction(unsignedTransaction)
        ),
        tap(console.debug)
        // exhaustMap((signedTransaction) =>
        //   this.alchemy.core.sendTransaction(signedTransaction)
        // ),
        // exhaustMap(({ hash }) => this.alchemy.core.waitForTransaction(hash)),
        // tap(() => this.stateChanges.next())
      )
    );
  }

  createTransitionMethod(wallet: Wallet) {
    return (functionName: string) =>
      defer(() =>
        this.simulateContract(wallet, { functionName }).pipe(
          /**
           * Alchemy does limit the RPC throughput; therefore
           * we need to add artifical delay to avoid rate limiting.
           * @todo To be removed once Alchemy upgrade plan.
           */
          delay(1000),
          exhaustMap(() =>
            this.writeContract(wallet, {
              functionName,
            })
          )
        )
      );
  }

  constructor(
    readonly auth: AuthService,
    @Inject(ActiveOrderContractAddress)
    readonly contractAddress: Promise<Address>
  ) {}
}
