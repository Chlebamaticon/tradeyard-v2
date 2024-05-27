import { Customer, CustomerDto } from '@tradeyard-v2/api-dtos';
import { CustomerViewEntity } from '@tradeyard-v2/server/database';

export function mapToCustomerDto({
  user,
  ...customer
}: CustomerViewEntity): CustomerDto {
  return Customer.parse({
    ...customer,
    first_name: user?.first_name,
    last_name: user?.last_name,
    email: user?.email,
  });
}
