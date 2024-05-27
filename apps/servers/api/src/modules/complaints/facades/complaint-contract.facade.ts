import { Inject, Injectable } from '@nestjs/common';
import { Address, PublicClient } from 'viem';

import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

import { AlchemyPublicClient, AlchemyWalletClient } from '../../alchemy';

// apps/servers/api/src/modules/complaints/facades/complaint-contract.facade.ts
@Injectable()
export class ComplaintContractFacade {
  release(contract: { address: Address }): Promise<void> {
    return this.walletClient
      .writeContract({
        address: contract.address,
        abi: artifact.abi,
        functionName: 'releaseComplaint',
      })
      .then((hash) => this.publicClient.waitForTransactionReceipt({ hash }));
  }

  reject(contract: { address: Address }): Promise<void> {
    return this.walletClient
      .writeContract({
        address: contract.address,
        abi: artifact.abi,
        functionName: 'rejectComplaint',
      })
      .then((hash) => this.publicClient.waitForTransactionReceipt({ hash }));
  }

  refund(contract: { address: Address }): Promise<void> {
    return this.walletClient
      .writeContract({
        address: contract.address,
        abi: artifact.abi,
        functionName: 'refundComplaint',
      })
      .then((hash) => this.publicClient.waitForTransactionReceipt({ hash }));
  }

  constructor(
    @Inject(AlchemyPublicClient) readonly publicClient: PublicClient,
    @Inject(AlchemyWalletClient) readonly walletClient
  ) {}
}
