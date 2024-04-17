import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { zeroAddress } from 'viem';

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
import { OffersService } from '../offers';
import { OrdersContractService } from '../orders-contract';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderViewEntity)
    readonly orderRepository: Repository<OrderViewEntity>,
    readonly eventRepository: EventRepository,
    readonly merchantService: MerchantsService,
    readonly customerService: CustomersService,
    readonly offersService: OffersService,
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

  createOne(body: CreateOrderBodyDto) {
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
