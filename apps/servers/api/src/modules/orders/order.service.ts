import assert from 'assert';
import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { isAddress, parseEther } from 'viem';

import {
  CreateOrderBodyDto,
  GetOrder,
  GetOrderDto,
  GetOrdersDto,
  GetOrdersParamsDto,
  GetOrdersQueryParamsDto,
  OrderDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  OrderViewEntity,
} from '@tradeyard-v2/server/database';

import { CustomerService } from '../customers';
import { MerchantService } from '../merchants';
import { OfferService, OfferVariantService } from '../offers';
import { OrdersContractService } from '../orders-contract';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderViewEntity)
    readonly orderRepository: Repository<OrderViewEntity>,
    readonly eventRepository: EventRepository,
    readonly merchantService: MerchantService,
    readonly customerService: CustomerService,
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
    merchant_id,
    customer_id,
  }: GetOrdersQueryParamsDto & GetOrdersParamsDto): Promise<GetOrdersDto> {
    const [offers, total] = await this.#queryBuilder({
      where: {
        customer_id,
        merchant_id,
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
    quantity,
    customer,
  }: CreateOrderBodyDto): Promise<OrderDto> {
    const order_id = crypto.randomUUID();
    const { merchant } = await this.offersService.getOne({
      offer_id,
    });
    const variant = await this.offerVariantsService.getOne({
      offer_id,
      offer_variant_id,
    });

    assert.ok(
      variant.current_price,
      `Offer variant ("${offer_variant_id}") is missing a price`
    );

    assert.ok(
      isAddress(merchant.address),
      "Merchant's address is not a valid ethereum address"
    );

    assert.ok(
      isAddress(customer.address),
      "Customer's address is not a valid ethereum address"
    );

    assert.ok(
      isAddress(variant.current_price.token.token_address),
      'Token address is not a valid ethereum address'
    );

    const { contract_id } = await this.orderContractService.deploy({
      target: {
        merchant: merchant.address,
        customer: customer.address,
      },
      conditions: {
        tokenAddress: variant.current_price.token.token_address,
        tokenAmountInWei: parseEther(`${variant.current_price.amount}`),
      },
      redemption: {
        timeoutInSeconds: BigInt(0),
      },
      orderId: order_id,
    });

    await this.eventRepository.publish('order:created', {
      order_id,
      offer_variant_id,
      offer_variant_price_id: variant.current_price.offer_variant_price_id,
      customer_id: randomUUID(),
      merchant_id: randomUUID(),
      contract_id,
      quantity,
    });

    return this.mapToOrderDto(
      await this.orderRepository.findOneByOrFail({ order_id })
    );
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
