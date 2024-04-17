import { Inject, Injectable } from '@nestjs/common';
import { deployContract } from '@nomicfoundation/hardhat-viem/types';
import { Hex, PublicClient, stringToHex, WalletClient } from 'viem';

import '@tradeyard-v2/contracts/ecommerce';
import { AlchemyPublicClient, AlchemyWalletClient } from '../alchemy';

export interface OrderTargetAddress {
  merchant: Hex;
  customer: Hex;
}

export interface OrderConditions {
  tokenAddress: Hex;
  tokenAmountInWei: bigint;
}

export interface OrderDeployInit {
  target: OrderTargetAddress;
  conditions: OrderConditions;
  redemption: {
    timeoutInSeconds: bigint;
  };
  orderId: string;
}

@Injectable({})
export class OrdersContractService {
  constructor(
    @Inject(AlchemyPublicClient) readonly publicClient: PublicClient,
    @Inject(AlchemyWalletClient) readonly walletClient: WalletClient
  ) {}

  async deploy(init: OrderDeployInit) {
    const result = await deployContract(
      'apps/contracts/ecommerce/contracts/Order.sol:Order',
      [
        init.target.customer,
        init.target.merchant,
        init.conditions.tokenAmountInWei,
        init.conditions.tokenAddress,
        init.redemption.timeoutInSeconds,
        stringToHex(init.orderId),
      ],
      {
        client: {
          public: this.publicClient,
          wallet: this.walletClient,
        },
      }
    );

    return result.address;
  }
}
