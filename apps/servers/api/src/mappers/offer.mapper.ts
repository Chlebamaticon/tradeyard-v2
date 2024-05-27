import { OfferDto, Offer, OfferVariant } from '@tradeyard-v2/api-dtos';
import {
  OfferViewEntity,
  OfferVariantPriceViewEntity,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

import { mapToOfferPriceDto } from './offer-price.mapper';

export function mapToOfferDto(
  offer: OfferViewEntity,
  enhancements: {
    latestVariantPrices?: Record<
      string,
      OfferVariantPriceViewEntity & { token: TokenViewEntity }
    >;
  } = {}
): OfferDto {
  const { variants = [] } = offer;
  const { latestVariantPrices = {} } = enhancements;
  return Offer.parse({
    ...offer,
    created_at: offer.created_at.toISOString(),
    variants: variants.map((variant) =>
      OfferVariant.parse({
        ...variant,
        current_price: latestVariantPrices[variant.offer_variant_id]
          ? mapToOfferPriceDto(latestVariantPrices[variant.offer_variant_id])
          : undefined,
      })
    ),
  });
}
