import assert from 'assert';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { isAddress, isHex, parseEther } from 'viem';

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

import { mapToOrderDto } from '../../mappers';
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
    const order = await this.orderRepository.findOne({
      where: { order_id },
      relations: {
        complaints: true,
        contract: true,
        customer: { user: true },
        merchant: { user: true },
        offerVariant: {
          offer: true,
          offerVariantPrices: {
            token: true,
          },
        },
      },
    });

    return GetOrder.parse(mapToOrderDto(order));
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
    const [offers, total] = await this.orderRepository.findAndCount({
      where: {
        ...where,
        created_at: LessThan(new Date(timestamp)),
      },
      relations: {
        complaints: true,
        contract: true,
        customer: { user: true },
        merchant: { user: true },
        offerVariant: {
          offer: true,
          offerVariantPrices: {
            token: true,
          },
        },
      },
      skip: offset,
      take: limit,
    });

    return {
      items: offers.map(mapToOrderDto),
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

    return mapToOrderDto(
      await this.orderRepository.findOneByOrFail({ order_id })
    );
  }
}
