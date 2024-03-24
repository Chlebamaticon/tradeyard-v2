import customerSchema from './customer';
import merchantSchema from './merchant';
import moderatorSchema from './moderator';
import offerSchema from './offer';
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
  ...userSchema,
};
