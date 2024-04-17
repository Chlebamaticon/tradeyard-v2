import customerSchema from './customer';
import merchantSchema from './merchant';
import moderatorSchema from './moderator';
import offerSchema from './offer';
import offerVariantSchema from './offer-variant';
import offerVariantPriceSchema from './offer-variant-price';
import orderSchema from './order';
import tokenSchema from './token';
import userSchema from './user';

export * from './customer';
export * from './merchant';
export * from './moderator';
export * from './offer';
export * from './user';

export default {
  ...customerSchema,
  ...merchantSchema,
  ...moderatorSchema,
  ...offerSchema,
  ...offerVariantSchema,
  ...offerVariantPriceSchema,
  ...orderSchema,
  ...userSchema,
  ...tokenSchema,
};
