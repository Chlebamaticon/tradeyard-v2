import customerSchema from './customer';
import merchantSchema from './merchant';
import moderatorSchema from './merchant';
import userSchema from './user';

export * from './customer';
export * from './merchant';
export * from './moderator';
export * from './user';

export default {
  ...customerSchema,
  ...merchantSchema,
  ...moderatorSchema,
  ...userSchema,
};
