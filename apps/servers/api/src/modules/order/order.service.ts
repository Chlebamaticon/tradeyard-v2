import { Injectable } from '@nestjs/common';
import { zeroAddress } from 'viem';

import { EventRepository } from '@tradeyard-v2/server/database';

import { CustomersService } from '../customers';
import { MerchantsService } from '../merchants';
import { OffersService } from '../offers';
import { OrderContractService } from '../order-contract';

@Injectable()
export class OrderService {
  constructor(
    readonly eventRepository: EventRepository,
    readonly merchantService: MerchantsService,
    readonly customerService: CustomersService,
    readonly offersService: OffersService,
    readonly orderContractService: OrderContractService
  ) {}

  create() {
    this.orderContractService.deploy({
      target: {
        merchant: zeroAddress,
        customer: zeroAddress,
      },
      conditions: {
        tokenAddress: zeroAddress,
        tokenAmountInWei: BigInt(0),
      },
      redemption: {
        timeoutInSeconds: BigInt(0),
      },
      orderId: '',
    });
  }
}
