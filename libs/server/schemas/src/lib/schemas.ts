import contractSchema from './contract';
import customerSchema from './customer';
import merchantSchema from './merchant';
import moderatorSchema from './moderator';
import offerSchema from './offer';
import offerVariantSchema from './offer-variant';
import offerVariantPriceSchema from './offer-variant-price';
import orderSchema from './order';
import tokenSchema from './token';
import userSchema from './user';
import userCredentialSchema from './user-credential';
import userWalletSchema from './user-wallet';

export * from './contract';
export * from './customer';
export * from './merchant';
export * from './moderator';
export * from './offer';
export * from './offer-variant';
export * from './offer-variant-price';
export * from './order';
export * from './token';
export * from './user';
export * from './user-credential';
export * from './user-wallet';

export default {
  ...contractSchema,
  ...customerSchema,
  ...merchantSchema,
  ...moderatorSchema,
  ...offerSchema,
  ...offerVariantSchema,
  ...offerVariantPriceSchema,
  ...orderSchema,
  ...userSchema,
  ...userCredentialSchema,
  ...userWalletSchema,
  ...tokenSchema,
};
