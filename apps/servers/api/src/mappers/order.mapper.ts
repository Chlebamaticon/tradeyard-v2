import assert from 'assert';

import { formatUnits } from 'viem';

import { currentChain, OrderDto } from '@tradeyard-v2/api-dtos';
import { OrderViewEntity } from '@tradeyard-v2/server/database';

import { mapToComplaintDto } from './complaint.mapper';

export function mapToOrderDto(order: OrderViewEntity): OrderDto {
  const { contract, merchant, customer, offerVariant } = order;

  assert.ok(merchant, 'Merchant not found');
  assert.ok(merchant.user, 'Merchant user not found');

  assert.ok(customer, 'Customer not found');
  assert.ok(customer.user, 'Customer user not found');

  assert.ok(offerVariant, 'Offer variant not found');
  assert.ok(offerVariant.offer, 'Offer not found');
  assert.ok(offerVariant.offerVariantPrices, 'Offer variant prices not found');

  assert.ok(contract, 'Contract not found');

  return {
    ...order,
    complaints: order.complaints ? order.complaints.map(mapToComplaintDto) : [],
    merchant: {
      merchant_id: merchant.merchant_id,
      first_name: merchant.user.first_name,
      last_name: merchant.user.last_name,
    },
    customer: {
      customer_id: customer.customer_id,
      first_name: customer.user.first_name,
      last_name: customer.user.last_name,
    },
    offer: {
      offer_id: offerVariant.offer.offer_id,
      title: offerVariant.offer.title,
      description: offerVariant.offer.description,
    },
    offer_variant: {
      offer_variant_id: offerVariant.offer_variant_id,
      title: offerVariant.title,
      description: offerVariant.description,
    },
    offer_variant_price: {
      offer_variant_price_id:
        offerVariant.offerVariantPrices[0].offer_variant_price_id,
      amount: +formatUnits(
        BigInt(offerVariant.offerVariantPrices[0].amount),
        offerVariant.offerVariantPrices[0].token!.precision
      ),
      token: offerVariant.offerVariantPrices[0].token!,
    },
    contract: {
      contract_id: contract.contract_id,
      address: contract.contract_address,
      chain: `${currentChain.id}`,
    },
    quantity: parseInt(`${order.quantity}`),
  };
}
