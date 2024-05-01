import assert from 'assert';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { formatUnits, isAddress, isHex, parseEther } from 'viem';

import {
  CreateOrderBodyDto,
  currentChain,
  GetOrder,
  GetOrderDto,
  GetOrdersDto,
  GetOrdersParamsDto,
  GetOrdersQueryParamsDto,
  OrderDto,
} from '@tradeyard-v2/api-dtos';
import {
  ContractViewEntity,
  EventRepository,
  MerchantViewEntity,
  OfferVariantPriceViewEntity,
  OfferVariantViewEntity,
  OfferViewEntity,
  OrderViewEntity,
  TokenViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

import { CustomerService } from '../customers';
import { MerchantService } from '../merchants';
import { OfferService, OfferVariantService } from '../offers';
import { OrdersContractService } from '../orders-contract';
import { UserWalletService } from '../users/user-wallet.service';

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
    readonly orderContractService: OrdersContractService,
    readonly userWalletService: UserWalletService
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
    const where: FindOptionsWhere<OrderViewEntity> = {};
    if (merchant_id) where.merchant_id = merchant_id;
    if (customer_id) where.customer_id = customer_id;
    const [offers, total] = await this.#queryBuilder({})
      .where({
        ...where,
        created_at: LessThan(new Date(timestamp)),
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
    user_id,
    offer_id,
    offer_variant_id,
    quantity,
    customer_address,
  }: CreateOrderBodyDto & { user_id: string }): Promise<OrderDto> {
    const order_id = crypto.randomUUID();
    const { merchant_id } = await this.offersService.getOne({
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
      isAddress(variant.current_price.token.token_address),
      'Token address is not a valid ethereum address'
    );

    const customer = await this.customerService.getOne({ user_id });
    const customerWallet = await this.userWalletService.getOne({
      user_id: customer.user_id,
      address: customer_address,
    });

    const merchant = await this.merchantService.getOne({ merchant_id });
    const merchantWallet = await this.userWalletService.getOne({
      user_id: merchant.user_id,
      type: 'turnkey',
    });

    const merchantAddress = isHex(merchantWallet.address)
      ? merchantWallet.address
      : (`0x${merchantWallet.address}` as const);
    const customerAddress = isHex(customerWallet.address)
      ? customerWallet.address
      : (`0x${customerWallet.address}` as const);
    const { contract_id } = await this.orderContractService.deploy({
      target: {
        merchant: merchantAddress,
        customer: customerAddress,
      },
      conditions: {
        tokenAddress: variant.current_price.token.token_address,
        tokenAmountInWei: parseEther(`${variant.current_price.amount}`),
      },
      redemption: {
        timeoutInSeconds: BigInt(1 * 24 * 60 * 60),
      },
      orderId: order_id,
    });

    await this.eventRepository.publish('order:created', {
      order_id,
      offer_variant_id,
      offer_variant_price_id: variant.current_price.offer_variant_price_id,
      customer_id: customer.customer_id,
      customer_address: customerAddress,
      merchant_id: merchant.merchant_id,
      merchant_address: merchantAddress,
      contract_id,
      quantity,
    });

    return this.mapToOrderDto(
      await this.#queryBuilder({ where: { order_id } }).getOneOrFail()
    );
  }

  mapToOrderDto(
    order: OrderViewEntity & {
      merchant_user?: UserViewEntity;
      merchant?: MerchantViewEntity;
      contract?: ContractViewEntity;
      offer?: OfferViewEntity;
      offer_variant?: OfferVariantViewEntity;
      offer_variant_price?: OfferVariantPriceViewEntity & {
        token?: TokenViewEntity;
      };
      token?: TokenViewEntity;
    }
  ): OrderDto {
    return {
      ...order,
      merchant: {
        merchant_id: order.merchant_id,
        first_name: order.merchant_user.first_name,
        last_name: order.merchant_user.last_name,
      },
      offer: {
        offer_id: order.offer.offer_id,
        title: order.offer.title,
        description: order.offer.description,
      },
      offer_variant: {
        offer_variant_id: order.offer_variant.offer_variant_id,
        title: order.offer_variant.title,
        description: order.offer_variant.description,
      },
      offer_variant_price: {
        offer_variant_price_id:
          order.offer_variant_price.offer_variant_price_id,
        amount: +formatUnits(
          BigInt(order.offer_variant_price.amount),
          order.token.precision
        ),
        token: order.token,
      },
      contract: {
        contract_id: order.contract.contract_id,
        address: order.contract.contract_address,
        chain: `${currentChain.id}`,
      },
      quantity: parseInt(`${order.quantity}`),
    };
  }

  #queryBuilder(
    options: FindManyOptions<OrderViewEntity> = {}
  ): SelectQueryBuilder<OrderViewEntity> {
    const { manager } = this.orderRepository;
    return (
      manager
        .createQueryBuilder<OrderViewEntity>(OrderViewEntity, 'order')
        // .setFindOptions(options)
        .leftJoinAndMapOne(
          'order.offer_variant',
          OfferVariantViewEntity,
          'offer_variant',
          '"offer_variant"."offer_variant_id" = "order"."offer_variant_id"'
        )
        .leftJoinAndMapOne(
          'order.offer',
          OfferViewEntity,
          'offer',
          '"offer"."offer_id" = "offer_variant"."offer_id"'
        )
        .leftJoinAndMapOne(
          'order.offer_variant_price',
          OfferVariantPriceViewEntity,
          'offer_variant_price',
          '"offer_variant_price"."offer_variant_price_id" = "order"."offer_variant_price_id"'
        )
        .leftJoinAndMapOne(
          'order.merchant',
          MerchantViewEntity,
          'merchant',
          '"merchant"."merchant_id" = "order"."merchant_id"'
        )
        .leftJoinAndMapOne(
          'order.contract',
          ContractViewEntity,
          'contract',
          '"contract"."contract_id" = "order"."contract_id"'
        )
        .leftJoinAndMapOne(
          'order.merchant_user',
          UserViewEntity,
          'merchant_user',
          '"merchant_user"."user_id" = "merchant"."user_id"'
        )
        .leftJoinAndMapOne(
          'order.token',
          TokenViewEntity,
          'token',
          '"token"."token_id" = "offer_variant_price"."token_id"'
        )
    );
    // .orderBy('"order"."created_at"', 'DESC');
  }
}
