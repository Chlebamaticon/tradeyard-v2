import assert from 'assert';

import { formatUnits } from 'viem';

import {
  OfferVariantPrice,
  OfferVariantPriceDto,
} from '@tradeyard-v2/api-dtos';
import { OfferVariantPriceViewEntity } from '@tradeyard-v2/server/database';

export function mapToOfferPriceDto(
  price: OfferVariantPriceViewEntity
): OfferVariantPriceDto {
  assert.ok(price.token, 'Token not found');
  return OfferVariantPrice.parse({
    offer_variant_price_id: price.offer_variant_price_id,
    amount: +formatUnits(BigInt(price.amount), price.token.precision),
    token: price.token,
  });
}
