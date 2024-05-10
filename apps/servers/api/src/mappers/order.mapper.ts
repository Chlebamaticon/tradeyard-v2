import { formatUnits } from 'viem';

import { currentChain, OrderDto } from '@tradeyard-v2/api-dtos';
import { OrderViewEntity } from '@tradeyard-v2/server/database';

import { mapToComplaintDto } from './complaint.mapper';

export function mapToOrderDto(order: OrderViewEntity): OrderDto {
  return {
    ...order,
    complaints: order.complaints.map(mapToComplaintDto),
    merchant: {
      merchant_id: order.merchant_id,
      first_name: order.merchant.user.first_name,
      last_name: order.merchant.user.last_name,
    },
    offer: {
      offer_id: order.offerVariant.offer.offer_id,
      title: order.offerVariant.offer.title,
      description: order.offerVariant.offer.description,
    },
    offer_variant: {
      offer_variant_id: order.offerVariant.offer_variant_id,
      title: order.offerVariant.title,
      description: order.offerVariant.description,
    },
    offer_variant_price: {
      offer_variant_price_id:
        order.offerVariant.offerVariantPrices[0].offer_variant_price_id,
      amount: +formatUnits(
        BigInt(order.offerVariant.offerVariantPrices[0].amount),
        order.offerVariant.offerVariantPrices[0].token.precision
      ),
      token: order.offerVariant.offerVariantPrices[0].token,
    },
    contract: {
      contract_id: order.contract.contract_id,
      address: order.contract.contract_address,
      chain: `${currentChain.id}`,
    },
    quantity: parseInt(`${order.quantity}`),
  };
}
