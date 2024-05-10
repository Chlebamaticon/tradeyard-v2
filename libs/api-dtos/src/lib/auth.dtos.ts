import * as zod from 'zod';

import { CreateUserBody, User } from './user.dtos';

const jwt = zod.object({
  access_token: zod.string(),
});

export const AuthSignIn = jwt.merge(zod.object({}));
export const AuthSignInBody = zod
  .object({
    password: zod.string(),
  })
  .merge(User.pick({ email: true }))
  .required()
  .strict();

export type AuthSignInDto = zod.infer<typeof AuthSignIn>;
export type AuthSignInBodyDto = zod.infer<typeof AuthSignInBody>;

export const AuthSignUp = jwt.merge(zod.object({}));
export const AuthSignUpBody = zod
  .object({
    type: zod.enum(['customer', 'merchant', 'moderator']),
    password: zod.string(),
  })
  .merge(CreateUserBody)
  .required();
export type AuthSignUpDto = zod.infer<typeof AuthSignUp>;
export type AuthSignUpBodyDto = zod.infer<typeof AuthSignUpBody>;
