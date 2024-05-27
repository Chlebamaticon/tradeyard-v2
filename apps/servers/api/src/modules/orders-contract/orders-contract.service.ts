/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
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
  readonly logger = new Logger(OrdersContractService.name);

  constructor(
    @Inject(AlchemyPublicClient) readonly publicClient: PublicClient,
    @Inject(AlchemyWalletClient) readonly walletClient,
    readonly eventRepository: EventRepository
  ) {}

  async deploy(init: OrderDeployInit) {
    const args = this.prepareOrderArguments(init);
    const contract = this.prepareOrderContract(args);
    const contract_id = crypto.randomUUID();
    const transaction_hash = await this.walletClient.deployContract(contract);

    return this.waitForOrderDeployment(transaction_hash, contract_id).catch(
      async (error) => {
        this.logger.warn('Failed to deploy contract', error.message);
        await this.eventRepository.publish('contract:deployment:failed', {
          contract_id,
          deployment: { transaction_hash, error_message: error.message },
        });
        return {
          contract_id,
          error: error.message,
        };
      }
    );
  }

  async waitForOrderDeployment(transaction_hash: Hex, contract_id: string) {
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
      deployment: { transaction_hash, address: contractAddress! },
    });
    this.logger.verbose('Completed contract deployment', {
      contractAddress,
      hash: transaction_hash,
    });
    return { contract_id, address: contractAddress };
  }

  prepareOrderArguments(init: OrderDeployInit) {
    return [
      init.target.customer,
      init.target.merchant,
      init.conditions.tokenAmountInWei,
      init.conditions.tokenAddress,
      init.redemption.timeoutInSeconds,
      stringToHex(init.orderId),
    ];
  }

  // apps/servers/api/src/modules/orders-contract/orders-contract.service.ts
  prepareOrderContract(args) {
    const orderArtifact: Order$Type = artifact as Order$Type;
    return {
      abi: orderArtifact.abi,
      bytecode: isHex(orderArtifact.bytecode)
        ? orderArtifact.bytecode
        : `0x${orderArtifact.bytecode}`,
      args,
    };
  }
}
