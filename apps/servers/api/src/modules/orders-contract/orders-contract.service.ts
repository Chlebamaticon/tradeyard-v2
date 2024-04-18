/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { Hex, stringToHex, isHex } from 'viem';

import { Order$Type } from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';

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
    @Inject(AlchemyPublicClient) readonly publicClient,
    @Inject(AlchemyWalletClient) readonly walletClient
  ) {}

  async deploy(init: OrderDeployInit) {
    const orderArtifact: Order$Type = artifact as Order$Type;
    const args = [
      init.target.customer,
      init.target.merchant,
      init.conditions.tokenAmountInWei,
      init.conditions.tokenAddress,
      init.redemption.timeoutInSeconds,
      stringToHex(init.orderId),
    ] as [
      `0x${string}`,
      `0x${string}`,
      bigint,
      `0x${string}`,
      bigint,
      `0x${string}`
    ];
    const result = await this.walletClient.deployContract({
      abi: orderArtifact.abi,
      bytecode: isHex(orderArtifact.bytecode)
        ? orderArtifact.bytecode
        : `0x${orderArtifact.bytecode}`,
      args,
    });
    // const result = await deployContract(
    //   'apps/contracts/ecommerce/contracts/Order.sol:Order' as any,
    //   [],
    //   {
    //     client: {
    //       public: this.publicClient,
    //       wallet: this.walletClient,
    //     },
    //   }
    // );
    console.log(result);
    return result;
  }
}
