import { Injectable } from '@angular/core';
import { Alchemy, Network } from 'alchemy-sdk';
import { defer, from, Observable, exhaustMap } from 'rxjs';
import { Address, getAddress, TransactionReceipt } from 'viem';

import { OrderStatus } from '@tradeyard-v2/api-dtos';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

import { AuthService } from '../../auth';

const alchemy = new Alchemy({
  apiKey: '6oy61c9A1D8Dm4e_rZ0KAAwf5KOZRCWM',
  network: Network.ETH_SEPOLIA,
});

@Injectable()
export class OrderContractService {
  getDepositAmount(address: Address): Observable<bigint> {
    return defer(
      () =>
        this.auth.walletClient.readContract({
          abi: artifact.abi,
          address,
          functionName: 'getOrderTokenAmount',
        }) as Promise<bigint>
    );
  }

  getStatus(address: Address): Observable<OrderStatus> {
    return defer(
      () =>
        this.auth.walletClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getOrderStatus',
        }) as Promise<OrderStatus>
    );
  }

  getCustomerAddress(address: Address): Observable<Address> {
    return defer(
      () =>
        this.auth.walletClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getCustomerAddress',
        }) as Promise<Address>
    );
  }

  getMerchantAddress(address: Address): Observable<Address> {
    return defer(
      () =>
        this.auth.walletClient.readContract({
          address,
          abi: artifact.abi,
          functionName: 'getMerchantAddress',
        }) as Promise<Address>
    );
  }

  deposit(address: Address, amount: bigint): Observable<TransactionReceipt> {
    return defer(() =>
      from(alchemy.core.getFeeData()).pipe(
        exhaustMap((feeData) =>
          this.auth.walletClient.simulateContract({
            abi: artifact.abi,
            address: getAddress(address),
            functionName: 'deposit',
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!.toBigInt(),
            maxFeePerGas: feeData.maxFeePerGas!.toBigInt(),
            type: 'eip1559',
          })
        ),
        exhaustMap(({ request }) =>
          this.auth.walletClient.writeContract(request)
        ),
        exhaustMap((hash) =>
          this.auth.walletClient.waitForTransactionReceipt({ hash })
        )
      )
    );
  }

  constructor(readonly auth: AuthService) {}
}
