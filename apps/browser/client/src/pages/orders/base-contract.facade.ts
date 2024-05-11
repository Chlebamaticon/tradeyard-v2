import { Injectable } from '@angular/core';
import { Observable, defer, exhaustMap, of, tap } from 'rxjs';
import { Address, createPublicClient } from 'viem';

import { currentChain, OrderStatus, transports } from '@tradeyard-v2/api-dtos';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

import { AuthService } from '../../modules/auth';

@Injectable()
export class BaseContract {
  get publicClient() {
    return createPublicClient({
      chain: currentChain,
      transport: transports[currentChain.id].wss,
    });
  }

  getStatus(contractAddress: Address): Observable<OrderStatus> {
    return defer(() =>
      this.readContractOnce<OrderStatus>('status', contractAddress)
    );
  }

  readContractOnce<T = unknown>(
    functionName: string,
    contractAddress: Address
  ): Observable<T> {
    return of(contractAddress).pipe(
      tap((args) => console.debug('readContractOnce', functionName, args)),
      exhaustMap(
        (address) =>
          this.publicClient.readContract({
            address,
            abi: artifact.abi,
            functionName,
          }) as Promise<T>
      )
    );
  }

  constructor(readonly auth: AuthService) {}
}
