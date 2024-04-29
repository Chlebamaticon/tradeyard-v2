import { Injectable } from '@angular/core';
import { hash } from 'bcrypt';
import { defer, from, Observable, exhaustMap, catchError, EMPTY } from 'rxjs';
import { Address, parseEther, parseGwei, TransactionReceipt } from 'viem';

import { currentChain, OrderStatus } from '@tradeyard-v2/api-dtos';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

import { AuthService } from '../../auth';

@Injectable()
export class OrderContractService {
  getDepositAmount(address: Address): Observable<bigint> {
    return defer(
      () =>
        this.auth.publicClient.readContract({
          abi: artifact.abi,
          address,
          functionName: 'getOrderTokenAmount',
        }) as Promise<bigint>
    );
  }

  getStatus(address: Address): Observable<OrderStatus> {
    return defer(
      () =>
        this.auth.publicClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getOrderStatus',
        }) as Promise<OrderStatus>
    );
  }

  getCustomerAddress(address: Address): Observable<Address> {
    return defer(
      () =>
        this.auth.publicClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getCustomerAddress',
        }) as Promise<Address>
    );
  }

  getMerchantAddress(address: Address): Observable<Address> {
    return defer(
      () =>
        this.auth.publicClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getMerchantAddress',
        }) as Promise<Address>
    );
  }

  getEscrowAddress(address: Address): Observable<Address> {
    return defer(
      () =>
        this.auth.publicClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getEscrowAddress',
        }) as Promise<Address>
    );
  }

  constructor(readonly auth: AuthService) {}

  deposit(address: Address, amount: bigint): Observable<TransactionReceipt> {
    return defer(() =>
      from(
        this.auth.publicClient.simulateContract({
          abi: artifact.abi,
          address,
          functionName: 'deposit',
          value: amount,
          args: [],
          chain: this.auth.walletClient.chain,
          account: this.auth.walletClient.account,
        })
      ).pipe(
        exhaustMap(({ request }) =>
          this.auth.walletClient
            .writeContract(request)
            .then((hash) =>
              this.auth.publicClient.waitForTransactionReceipt({ hash })
            )
        ),
        catchError((error: any) => {
          console.log({ error });
          return EMPTY;
        })
      )
    );
  }
}
