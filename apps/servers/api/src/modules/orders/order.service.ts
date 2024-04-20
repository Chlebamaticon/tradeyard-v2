import assert from 'assert';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { isAddress, isHex, zeroAddress } from 'viem';

import {
  CreateOrderBodyDto,
  GetOrder,
  GetOrderDto,
  GetOrdersDto,
  GetOrdersQueryParamsDto,
  OrderDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  OrderViewEntity,
} from '@tradeyard-v2/server/database';

import { CustomersService } from '../customers';
import { MerchantsService } from '../merchants';
import { OfferService, OfferVariantService } from '../offers';
import { OrdersContractService } from '../orders-contract';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderViewEntity)
    readonly orderRepository: Repository<OrderViewEntity>,
    readonly eventRepository: EventRepository,
    readonly merchantService: MerchantsService,
    readonly customerService: CustomersService,
    readonly offersService: OfferService,
    readonly offerVariantsService: OfferVariantService,
    readonly orderContractService: OrdersContractService
  ) {}

  async getOne({ order_id }: { order_id?: string }): Promise<GetOrderDto> {
    const order = await this.#queryBuilder({
      where: { order_id },
    }).getOneOrFail();

    return GetOrder.parse(this.mapToOrderDto(order));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetOrdersQueryParamsDto): Promise<GetOrdersDto> {
    const [offers, total] = await this.#queryBuilder({
      where: {
        created_at: LessThan(new Date(timestamp)),
      },
    })
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items: offers.map((order) => this.mapToOrderDto(order)),
      total,
      offset,
      limit,
      timestamp,
    };
  }

  async createOne({
    offer_id,
    offer_variant_id,
    customer,
  }: CreateOrderBodyDto) {
    const { merchant } = await this.offersService.getOne({
      offer_id,
    });
    const variant = await this.offerVariantsService.getOne({
      offer_id,
      offer_variant_id,
    });

    console.log(variant);

    // assert.ok(
    //   current_price,
    //   `Offer variant ("${offer_variant_id}") is missing a price`
    // );

    assert.ok(
      isAddress(merchant.address),
      "Merchant's address is not a valid ethereum address"
    );

    assert.ok(
      isAddress(customer.address),
      "Customer's address is not a valid ethereum address"
    );

    this.orderContractService.deploy({
      target: {
        merchant: merchant.address,
        customer: zeroAddress,
      },
      conditions: {
        tokenAddress: zeroAddress,
        tokenAmountInWei: BigInt(0),
      },
      redemption: {
        timeoutInSeconds: BigInt(0),
      },
      orderId: crypto.randomUUID(),
    });
  }

  mapToOrderDto(order: OrderViewEntity): OrderDto {
    return {
      ...order,
      quantity: parseInt(`${order.quantity}`),
    };
  }

  #queryBuilder(
    options: FindManyOptions<OrderViewEntity> = {}
  ): SelectQueryBuilder<OrderViewEntity> {
    const { manager } = this.orderRepository;
    return manager
      .createQueryBuilder<OrderViewEntity>(OrderViewEntity, 'order')
      .setFindOptions(options);
  }
}
