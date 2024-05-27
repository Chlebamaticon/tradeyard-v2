import { formatUnits } from 'viem';

import {
  OfferVariant,
  OfferVariantDto,
  OfferVariantPrice,
} from '@tradeyard-v2/api-dtos';
import {
  OfferVariantPriceViewEntity,
  OfferVariantViewEntity,
} from '@tradeyard-v2/server/database';

export function mapToOfferVariantDto(
  offerVariant: OfferVariantViewEntity,
  latestPrice: Record<string, OfferVariantPriceViewEntity>
): OfferVariantDto {
  const variantPrice = latestPrice[offerVariant.offer_variant_id];
  const currentPrice = variantPrice?.token
    ? OfferVariantPrice.parse({
        ...variantPrice,
        amount: +formatUnits(
          BigInt(variantPrice.amount),
          variantPrice.token.precision
        ),
      })
    : null;

  return OfferVariant.parse({
    ...offerVariant,
    current_price: currentPrice,
  });
}
