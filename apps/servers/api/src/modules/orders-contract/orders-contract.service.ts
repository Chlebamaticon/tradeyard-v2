/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hex, stringToHex, isHex, PublicClient } from 'viem';

import { Order$Type } from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order';
import artifact from '@tradeyard-v2/contracts/ecommerce/artifacts/Order.sol/Order.json';
import { EventRepository } from '@tradeyard-v2/server/database';

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
    @Inject(AlchemyWalletClient) readonly walletClient,
    readonly eventRepository: EventRepository
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

    const contract_id = crypto.randomUUID();
    const result = await this.walletClient.deployContract({
      abi: orderArtifact.abi,
      bytecode: isHex(orderArtifact.bytecode)
        ? orderArtifact.bytecode
        : `0x${orderArtifact.bytecode}`,
      args,
    });

    const transaction_hash = result;
    try {
      await this.eventRepository.publish('contract:created', { contract_id });
      await this.eventRepository.publish('contract:deployment:started', {
        contract_id,
        deployment: { transaction_hash },
      });

      const { contractAddress } =
        await this.publicClient.waitForTransactionReceipt({
          hash: transaction_hash,
        });

      await this.eventRepository.publish('contract:deployment:completed', {
        contract_id,
        deployment: { transaction_hash, address: contractAddress },
      });

      return { contract_id, address: contractAddress };
    } catch (error) {
      await this.eventRepository.publish('contract:deployment:failed', {
        contract_id,
        deployment: { transaction_hash, error_message: error.message },
      });
      return {
        contract_id,
        error: error.message,
      };
    }
  }
}
