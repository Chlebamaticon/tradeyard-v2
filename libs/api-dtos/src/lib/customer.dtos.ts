import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';
import { User } from './user.dtos';

export const Customer = zod
  .object({
    customer_id: zod.string().uuid(),
  })
  .merge(User);
export type CustomerDto = zod.infer<typeof Customer>;

export const GetCustomerPathParams = zod
  .object({})
  .merge(Customer.pick({ customer_id: true }));
export const GetCustomer = zod.object({}).merge(Customer);
export type GetCustomerDto = zod.infer<typeof GetCustomer>;
export type GetCustomerPathParamsDto = zod.infer<typeof GetCustomerPathParams>;

export const GetCustomersQueryParams = queryParams({});
export const GetCustomers = pagination(Customer);
export type GetCustomersDto = zod.infer<typeof GetCustomers>;
export type GetCustomersQueryParamsDto = zod.infer<
  typeof GetCustomersQueryParams
>;

export const CreateCustomerBody = zod.object({
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});
export const CreateCustomer = zod.object({}).merge(Customer);
export type CreateCustomerDto = zod.infer<typeof CreateCustomer>;
export type CreateCustomerBodyDto = zod.infer<typeof CreateCustomerBody>;

export const UpdateCustomerBody = zod
  .object({
    customer_id: zod.string().uuid(),
  })
  .merge(
    Customer.pick({ first_name: true, last_name: true, email: true }).partial()
  );
export const UpdateCustomerPathParams = zod.object({
  customer_id: zod.string().uuid(),
});
export const UpdateCustomer = zod.object({}).merge(Customer);
export type UpdateCustomerDto = zod.infer<typeof UpdateCustomer>;
export type UpdateCustomerBodyDto = zod.infer<typeof UpdateCustomerBody>;
export type UpdateCustomerPathParamsDto = zod.infer<
  typeof UpdateCustomerPathParams
>;
